import { once, EventEmitter } from 'node:events'
import { promisify } from 'node:util'
import { SerialPort } from 'serialport'
import chalk from 'chalk'
import debug from 'debug'

const log = debug('ssp')

import {
  argsToByte,
  CRC16,
  extractPacketData,
  generateKeys,
  getPacket,
  parseData,
  createSSPHostEncryptionKey,
  validateNodeVersion,
  SSPKeys,
  ParsedResult,
} from './utils'
import commandList from './static/commands.json'
import { SSPParser } from './parser/index'

interface PortOptions {
  baudRate?: number
  dataBits?: 5 | 6 | 7 | 8
  stopBits?: 1 | 1.5 | 2
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space'
  highWaterMark?: number
  [key: string]: unknown
}

const PORT_OPTIONS: PortOptions = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 2,
  parity: 'none',
  highWaterMark: 64 * 1024,
}

interface SSPConfig {
  encryptAllCommand?: boolean
  id?: number
  timeout?: number
  commandRetries?: number
  pollingInterval?: number
  [key: string]: unknown
}

interface DebugData {
  command: string
  tx: {
    createdAt: number
    encrypted: Buffer
    plain: Buffer
  }
  rx: {
    createdAt: number | null
    encrypted: Buffer | null
    plain: Buffer | null
  }
}

class SSP extends EventEmitter {
  config: Required<Pick<SSPConfig, 'encryptAllCommand' | 'id' | 'timeout' | 'commandRetries' | 'pollingInterval'>>
  keys: SSPKeys
  state: { enabled: boolean; polling: boolean; processing: boolean }
  eCount: number
  commandSendAttempts: number
  sequence: number
  protocol_version: number | null
  unit_type: string | null

  private port!: SerialPort
  private parser!: SSPParser
  private eventEmitter: EventEmitter
  private pollTimeout?: ReturnType<typeof setTimeout>

  constructor(config: SSPConfig) {
    super()
    validateNodeVersion()

    this.eventEmitter = new EventEmitter()

    const { fixedKey = '0123456701234567', ...otherConfig } = config as SSPConfig & { fixedKey?: string }
    this.config = {
      encryptAllCommand: true,
      id: 0,
      timeout: 1000,
      commandRetries: 20,
      pollingInterval: 300,
      ...otherConfig,
    }

    this.keys = {
      encryptKey: null,
      fixedKey,
      generator: null,
      hostInter: null,
      hostRandom: null,
      key: null,
      modulus: null,
      slaveInterKey: null,
    }

    this.state = {
      enabled: false,
      polling: false,
      processing: false,
    }

    this.eCount = 0
    this.commandSendAttempts = 0
    this.sequence = 0x80

    this.protocol_version = null
    this.unit_type = null
  }

  async open(port: string, options: PortOptions = {}): Promise<void> {
    const serialOptions = { ...PORT_OPTIONS, ...options }

    this.port = new SerialPort({ path: port, autoOpen: false, ...serialOptions } as ConstructorParameters<typeof SerialPort>[0])

    this.port.on('open', () => {
      this.emit('OPEN')
    })

    this.port.on('close', () => {
      this.emit('CLOSE')
    })

    this.port.on('error', (error: Error) => {
      this.emit('ERROR', error)
      this.eventEmitter.emit('error', error)
    })

    this.parser = this.port.pipe(new SSPParser())
    this.parser.on('data', (buffer: Buffer) => {
      this.eventEmitter.emit('DATA', buffer)
    })

    return promisify(this.port.open.bind(this.port))()
  }

  async close(): Promise<void> {
    if (this.port !== undefined) {
      return promisify(this.port.close.bind(this.port))()
    }
    return
  }

  getSequence(): number {
    return this.config.id | this.sequence
  }

  async initEncryption(): Promise<ParsedResult> {
    const newKeys = generateKeys()

    Object.assign(this.keys, newKeys, { encryptKey: null })
    this.eCount = 0

    const commands = [
      { command: 'SET_GENERATOR', args: { key: this.keys.generator! } },
      { command: 'SET_MODULUS', args: { key: this.keys.modulus! } },
      { command: 'REQUEST_KEY_EXCHANGE', args: { key: this.keys.hostInter! } },
    ]

    let result!: ParsedResult
    for (const { command, args } of commands) {
      result = await this.command(command, args)
      if (!result || !result.success) {
        throw result
      }
    }

    return result
  }

  parsePacketData(buffer: Buffer, command: string): ParsedResult {
    const parsedData = parseData(buffer, command, this.protocol_version, this.unit_type)

    log(parsedData)

    if (parsedData.success) {
      if (command === 'REQUEST_KEY_EXCHANGE') {
        try {
          const keys = createSSPHostEncryptionKey(Buffer.from(parsedData.info.key as number[]), this.keys)
          this.keys = { ...this.keys, ...keys }

          log('AES encrypt key:', chalk.red(`0x${Buffer.from(this.keys.encryptKey!).toString('hex')}`))
          log(this.keys)
        } catch (error) {
          log(error)
          throw new Error('Key exchange error')
        }
      } else if (command === 'SETUP_REQUEST') {
        this.protocol_version = parsedData.info.protocol_version as number
        this.unit_type = parsedData.info.unit_type as string
      } else if (command === 'UNIT_DATA') {
        this.unit_type = parsedData.info.unit_type as string
      }
    } else {
      if (command === 'HOST_PROTOCOL_VERSION') {
        this.protocol_version = undefined as unknown as null
      }
    }

    return parsedData
  }

  async enable(): Promise<ParsedResult> {
    const result = await this.command('ENABLE')

    if (result.status === 'OK') {
      this.state.enabled = true
      if (!this.state.polling) await this.poll(true)
    }

    return result
  }

  async disable(): Promise<ParsedResult> {
    if (this.state.polling) await this.poll(false)

    const result = await this.command('DISABLE')

    if (result.status === 'OK') {
      this.state.enabled = false
    }

    return result
  }

  async command(command: string, args?: Record<string, unknown>): Promise<ParsedResult> {
    command = command.toUpperCase()
    const cmd = (commandList as Record<string, { encrypted: boolean }>)[command]
    if (cmd === undefined) {
      throw new Error('Unknown command')
    }

    if (cmd.encrypted && this.keys.encryptKey === null) {
      throw new Error('Command requires ecnryption')
    }

    if (this.state.processing) {
      throw new Error('Already processing another command')
    }

    if (command === 'SYNC') {
      this.sequence = 0x80
    }

    this.commandSendAttempts = 0

    const isEncrypted = this.keys.encryptKey !== null && (cmd.encrypted || this.config.encryptAllCommand)
    const argBytes = argsToByte(command, args as Parameters<typeof argsToByte>[1], this.protocol_version)
    const sequence = this.getSequence()
    const encryptionKey = isEncrypted ? this.keys.encryptKey! : null

    const buffer = getPacket(command, argBytes, sequence, encryptionKey, this.eCount)
    const bufferPlain = isEncrypted ? getPacket(command, argBytes, sequence, null, this.eCount) : buffer

    const result = await this.sendToDevice(command, buffer, bufferPlain)

    this.sequence = this.sequence === 0x00 ? 0x80 : 0x00

    if (!result.success) {
      throw result
    }

    return result
  }

  private async sendToDevice(command: string, txBuffer: Buffer, txBufferPlain: Buffer): Promise<ParsedResult> {
    for (let i = 0; i < this.config.commandRetries; i++) {
      this.state.processing = true
      log('COM <-', chalk.cyan(txBuffer.toString('hex')), chalk.green(command), this.eCount, Date.now())
      const debugData: DebugData = {
        command,
        tx: {
          createdAt: Date.now(),
          encrypted: txBuffer,
          plain: txBufferPlain,
        },
        rx: {
          createdAt: null,
          encrypted: null,
          plain: null,
        },
      }

      const commandTimeout = setTimeout(() => {
        this.eventEmitter.emit('error', new Error('TIMEOUT'))
      }, this.config.timeout)

      try {
        this.port.write(txBuffer)
        this.commandSendAttempts += 1

        const [rxBuffer] = await once(this.eventEmitter, 'DATA')
        clearTimeout(commandTimeout)
        debugData.rx.createdAt = Date.now()
        debugData.rx.encrypted = rxBuffer

        log('COM ->', chalk.yellow(rxBuffer.toString('hex')), chalk.green(command), this.eCount, Date.now())

        const DATA = extractPacketData(rxBuffer, this.keys.encryptKey, this.eCount)
        debugData.rx.plain = Buffer.from([...rxBuffer.slice(0, 2), DATA.length, ...DATA, ...CRC16([rxBuffer[1], DATA.length, ...DATA])])

        if (txBuffer[1] !== rxBuffer[1]) {
          throw new Error('Sequence flag mismatch')
        }

        if (this.keys.encryptKey && rxBuffer[3] === 0x7e) {
          this.eCount += 1
        }

        return this.parsePacketData(DATA, command)
      } catch (error) {
        debugData.rx.createdAt = Date.now()
        if (this.commandSendAttempts == this.config.commandRetries) {
          throw {
            success: false,
            error: `Command failed afte ${this.config.commandRetries} retries`,
            reason: error,
          }
        }
      } finally {
        clearTimeout(commandTimeout)
        this.state.processing = false
        this.emit('DEBUG', debugData)
      }
    }

    // Should not be reachable, but satisfies the return type
    throw { success: false, error: 'Command failed', reason: new Error('Retry loop exhausted') }
  }

  async poll(status: boolean | null = null): Promise<ParsedResult | void> {
    if (this.state.processing)
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          if (!this.state.processing) {
            clearInterval(interval)
            resolve()
          }
        }, 1)
      })

    if (status === true && this.state.polling === true) return

    if (status === true) {
      this.state.polling = true
    } else if (status === false) {
      this.state.polling = false
      if (this.pollTimeout) clearTimeout(this.pollTimeout)
    }

    if (this.state.polling) {
      try {
        const startTime = Date.now()
        const result = await this.command('POLL')

        if (result.info) {
          const infos = Array.isArray(result.info) ? result.info : [result.info]
          ;(infos as Record<string, unknown>[]).forEach(info => this.emit(info.name as string, info))
        }

        const endTime = Date.now()
        const executionTime = endTime - startTime
        this.pollTimeout = setTimeout(
          async () => {
            try {
              await this.poll()
            } catch (error) {
              this.emit('ERROR', error)
            }
          },
          Math.max(0, this.config.pollingInterval - executionTime),
        )

        return result
      } catch (error) {
        this.state.polling = false
        throw error
      }
    }
  }
}

export = SSP
