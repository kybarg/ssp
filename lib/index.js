const { once, EventEmitter } = require('node:events')
const { promisify } = require('node:util')
const { SerialPort } = require('serialport')
const chalk = require('chalk')
const debug = require('debug')('ssp')
const {
  argsToByte,
  CRC16,
  extractPacketData,
  generateKeys,
  getPacket,
  parseData,
  createSSPHostEncryptionKey,
  validateNodeVersion,
} = require('./utils.js')
const commandList = require('./static/commands.json')
const { SSPParser } = require('./parser/index.js')

const PORT_OPTIONS = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 2,
  parity: 'none',
  highWaterMark: 64 * 1024,
}

class SSP extends EventEmitter {
  constructor(config) {
    super()
    validateNodeVersion()

    // Initialize event emitter
    this.eventEmitter = new EventEmitter()

    // Initialize config
    const { fixedKey = '0123456701234567', ...otherConfig } = config
    this.config = {
      encryptAllCommand: true,
      id: 0,
      timeout: 1000,
      commandRetries: 20,
      pollingInterval: 300,
      ...otherConfig,
    }

    // Initialize keys
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

    // Initialize state
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

  async open(port, options = {}) {
    const serialOptions = { ...PORT_OPTIONS, ...options }

    this.port = new SerialPort({ path: port, ...serialOptions, autoOpen: true })

    await once(this.port, 'open')

    this.port.on('open', () => {
      this.emit('OPEN')
    })

    this.port.on('close', () => {
      this.emit('CLOSE')
    })

    this.port.on('error', error => {
      this.emit('ERROR', error)
      this.eventEmitter.emit('error', error)
    })

    this.parser = this.port.pipe(new SSPParser())
    this.parser.on('data', buffer => {
      this.eventEmitter.emit('DATA', buffer)
    })

    return
  }

  async close() {
    if (this.port !== undefined) {
      await promisify(this.port.close)()
    }
    return
  }

  getSequence() {
    return this.config.id | this.sequence
  }

  /**
   * Exchange encryption keys.
   *
   * @returns {Promise<Object>} result - The result of the key exchange.
   */
  async initEncryption() {
    const newKeys = generateKeys()

    // Reset counter and keys
    Object.assign(this.keys, newKeys, { encryptKey: null })
    this.eCount = 0

    // Define key exchange commands
    const commands = [
      { command: 'SET_GENERATOR', args: { key: this.keys.generator } },
      { command: 'SET_MODULUS', args: { key: this.keys.modulus } },
      { command: 'REQUEST_KEY_EXCHANGE', args: { key: this.keys.hostInter } },
    ]

    // Execute key exchange commands sequentially
    let result
    for (const { command, args } of commands) {
      result = await this.command(command, args)
      if (!result || !result.success) {
        throw result
      }
    }

    return result
  }

  parsePacketData(buffer, command) {
    const parsedData = parseData(buffer, command, this.protocol_version, this.unit_type)

    debug(parsedData)

    if (parsedData.success) {
      if (command === 'REQUEST_KEY_EXCHANGE') {
        try {
          const keys = createSSPHostEncryptionKey(Buffer.from(parsedData.info.key), this.keys)
          this.keys = { ...this.keys, ...keys }

          debug('AES encrypt key:', chalk.red(`0x${Buffer.from(this.keys.encryptKey).toString('hex')}`))
          debug(this.keys)
        } catch (error) {
          throw new Error('Key exchange error')
        }
      } else if (command === 'SETUP_REQUEST') {
        this.protocol_version = parsedData.info.protocol_version
        this.unit_type = parsedData.info.unit_type
      } else if (command === 'UNIT_DATA') {
        this.unit_type = parsedData.info.unit_type
      }
    } else {
      if (command === 'HOST_PROTOCOL_VERSION') {
        this.protocol_version = undefined
      }
    }

    return parsedData
  }

  /**
   * Enable for acepting cash.
   *
   * @returns {Promise<Object>} result - The result of the enable command.
   */
  async enable() {
    const result = await this.command('ENABLE')

    if (result.status === 'OK') {
      this.state.enabled = true
      if (!this.state.polling) await this.poll(true)
    }

    return result
  }

  /**
   * Disable for acepting cash.
   *
   * @returns {Promise<Object>} result - The result of the disable command.
   */
  async disable() {
    if (this.state.polling) await this.poll(false)

    const result = await this.command('DISABLE')

    if (result.status === 'OK') {
      this.state.enabled = false
    }

    return result
  }

  async command(command, args) {
    command = command.toUpperCase()
    if (commandList[command] === undefined) {
      throw new Error('Unknown command')
    }

    if (commandList[command].encrypted && this.keys.encryptKey === null) {
      throw new Error('Command requires ecnryption')
    }

    if (this.state.processing) {
      throw new Error('Already processing another command')
    }

    if (command === 'SYNC') {
      this.sequence = 0x80
    }

    this.commandSendAttempts = 0

    const isEncrypted = this.keys.encryptKey !== null && (commandList[command].encrypted || this.config.encryptAllCommand)
    const argBytes = argsToByte(command, args, this.protocol_version)
    const sequence = this.getSequence()
    const encryptionKey = isEncrypted ? this.keys.encryptKey : null

    const buffer = getPacket(command, argBytes, sequence, encryptionKey, this.eCount)
    const bufferPlain = isEncrypted ? getPacket(command, argBytes, sequence, null, this.eCount) : buffer

    const result = await this.sendToDevice(command, buffer, bufferPlain)

    // update sequence after response received
    this.sequence = this.sequence === 0x00 ? 0x80 : 0x00

    if (!result.success) {
      throw result
    }

    return result
  }

  async sendToDevice(command, txBuffer, txBufferPlain) {
    for (let i = 0; i < this.config.commandRetries; i++) {
      // Set processing state
      this.state.processing = true
      debug('COM <-', chalk.cyan(txBuffer.toString('hex')), chalk.green(command), this.eCount, Date.now())
      const debugData = {
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

      // Define command timeout
      const commandTimeout = setTimeout(() => {
        this.eventEmitter.emit('error', new Error('TIMEOUT'))
      }, this.config.timeout)

      try {
        // Send command to device
        this.port.write(txBuffer)
        this.commandSendAttempts += 1

        // Await data from device
        const [rxBuffer] = await once(this.eventEmitter, 'DATA')
        clearTimeout(commandTimeout)
        debugData.rx.createdAt = Date.now()
        debugData.rx.encrypted = rxBuffer

        debug('COM ->', chalk.yellow(rxBuffer.toString('hex')), chalk.green(command), this.eCount, Date.now())

        // Extract packet data bytes omiting packing data
        const DATA = extractPacketData(rxBuffer, this.keys.encryptKey, this.eCount)
        debugData.rx.plain = Buffer.from([...rxBuffer.slice(0, 2), DATA.length, ...DATA, ...CRC16([rxBuffer[1], DATA.length, ...DATA])])

        // Check if sequence flag mismatch
        if (txBuffer[1] !== rxBuffer[1]) {
          throw new Error('Sequence flag mismatch')
        }

        // Increment counter if encrypted command is received
        if (this.keys.encryptKey && rxBuffer[3] === 0x7e) {
          this.eCount += 1
        }

        // Return parsed packet data
        return this.parsePacketData(DATA, command)
      } catch (error) {
        debugData.rx.createdAt = Date.now()
        // Retry sending the same command
        // After 20 retries, host assumes that the slave has crashed.
        if (this.commandSendAttempts == this.config.commandRetries) {
          throw {
            success: false,
            error: `Command failed afte ${this.config.commandRetries} retries`,
            reason: error,
          }
        }
      } finally {
        // Unset processing state and clear command fail timeout
        clearTimeout(commandTimeout)
        this.state.processing = false
        this.emit('DEBUG', debugData)
      }
    }
  }

  async poll(status = null) {
    // Wait until processing is finished
    if (this.state.processing)
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (!this.state.processing) {
            clearInterval(interval)
            resolve()
          }
        }, 1)
      })

    // If status is true and polling is already in progress, exit early
    if (status === true && this.state.polling === true) return

    // Start polling if status is true
    if (status === true) {
      this.state.polling = true
    }
    // Stop polling if status is false
    else if (status === false) {
      this.state.polling = false
      clearTimeout(this.pollTimeout)
    }

    // Poll only if polling is enabled
    if (this.state.polling) {
      try {
        const startTime = Date.now()
        const result = await this.command('POLL')

        // Emit events if result contains info
        if (result.info) {
          const infos = Array.isArray(result.info) ? result.info : [result.info]
          infos.forEach(info => this.emit(info.name, info))
        }

        // Calculate execution time and schedule next poll
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
        // Stop polling in case of error
        this.state.polling = false
        throw error
      }
    }
  }
}

module.exports = SSP
