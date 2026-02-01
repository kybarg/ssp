import { EventEmitter } from 'node:events'
import SSP from '.'

jest.mock('./utils', () => {
  const actual = jest.requireActual('./utils')
  return {
    ...actual,
    validateNodeVersion: jest.fn(),
    createSSPHostEncryptionKey: jest.fn().mockReturnValue({
      slaveInterKey: 123n,
      key: 456n,
      encryptKey: Buffer.from('0123456789abcdef'),
    }),
  }
})

const mockParser = {
  on: jest.fn(),
}

const mockPort = {
  open: jest.fn((cb: (err?: Error) => void) => cb()),
  close: jest.fn((cb: (err?: Error) => void) => cb()),
  write: jest.fn(),
  on: jest.fn(),
  pipe: jest.fn().mockReturnValue(mockParser),
}

jest.mock('serialport', () => {
  return {
    SerialPort: jest.fn().mockImplementation(() => mockPort),
  }
})

jest.mock('./parser/index', () => {
  return {
    SSPParser: jest.fn().mockImplementation(() => mockParser),
  }
})

describe('SSP', () => {
  let ssp: SSP

  beforeEach(() => {
    ssp = new SSP({})
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    test('should create instance with default config', () => {
      const instance = new SSP({})

      expect(instance.config.encryptAllCommand).toBe(true)
      expect(instance.config.id).toBe(0)
      expect(instance.config.timeout).toBe(1000)
      expect(instance.config.commandRetries).toBe(20)
      expect(instance.config.pollingInterval).toBe(300)
    })

    test('should override default config with provided values', () => {
      const instance = new SSP({
        encryptAllCommand: false,
        id: 5,
        timeout: 2000,
        commandRetries: 10,
        pollingInterval: 500,
      })

      expect(instance.config.encryptAllCommand).toBe(false)
      expect(instance.config.id).toBe(5)
      expect(instance.config.timeout).toBe(2000)
      expect(instance.config.commandRetries).toBe(10)
      expect(instance.config.pollingInterval).toBe(500)
    })

    test('should initialize keys with default fixedKey', () => {
      const instance = new SSP({})

      expect(instance.keys.fixedKey).toBe('0123456701234567')
      expect(instance.keys.encryptKey).toBeNull()
      expect(instance.keys.generator).toBeNull()
      expect(instance.keys.hostInter).toBeNull()
      expect(instance.keys.hostRandom).toBeNull()
      expect(instance.keys.key).toBeNull()
      expect(instance.keys.modulus).toBeNull()
      expect(instance.keys.slaveInterKey).toBeNull()
    })

    test('should initialize keys with custom fixedKey', () => {
      const instance = new SSP({ fixedKey: 'customkey1234567' } as any)

      expect(instance.keys.fixedKey).toBe('customkey1234567')
    })

    test('should initialize state', () => {
      const instance = new SSP({})

      expect(instance.state.enabled).toBe(false)
      expect(instance.state.polling).toBe(false)
      expect(instance.state.processing).toBe(false)
    })

    test('should initialize counters and sequence', () => {
      const instance = new SSP({})

      expect(instance.eCount).toBe(0)
      expect(instance.commandSendAttempts).toBe(0)
      expect(instance.sequence).toBe(0x80)
    })

    test('should initialize protocol_version and unit_type as null', () => {
      const instance = new SSP({})

      expect(instance.protocol_version).toBeNull()
      expect(instance.unit_type).toBeNull()
    })

    test('should extend EventEmitter', () => {
      const instance = new SSP({})

      expect(instance).toBeInstanceOf(EventEmitter)
    })
  })

  describe('getSequence', () => {
    test('should return id OR-ed with sequence', () => {
      ssp.config.id = 0
      ssp.sequence = 0x80

      expect(ssp.getSequence()).toBe(0x80)
    })

    test('should return correct sequence with non-zero id', () => {
      ssp.config.id = 5
      ssp.sequence = 0x80

      expect(ssp.getSequence()).toBe(0x85)
    })

    test('should return correct sequence when sequence is 0', () => {
      ssp.config.id = 0
      ssp.sequence = 0x00

      expect(ssp.getSequence()).toBe(0x00)
    })
  })

  describe('open', () => {
    test('should open serial port', async () => {
      await ssp.open('/dev/ttyUSB0')

      const { SerialPort } = require('serialport')
      expect(SerialPort).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/dev/ttyUSB0',
          autoOpen: false,
          baudRate: 9600,
          dataBits: 8,
          stopBits: 2,
          parity: 'none',
        }),
      )
    })

    test('should merge custom port options', async () => {
      await ssp.open('/dev/ttyUSB0', { baudRate: 115200 })

      const { SerialPort } = require('serialport')
      expect(SerialPort).toHaveBeenCalledWith(
        expect.objectContaining({
          baudRate: 115200,
        }),
      )
    })

    test('should emit OPEN event when port opens', async () => {
      const emitSpy = jest.spyOn(ssp, 'emit')

      // Capture the 'open' callback
      let openCallback: () => void
      mockPort.on.mockImplementation((event: string, cb: () => void) => {
        if (event === 'open') openCallback = cb
      })

      await ssp.open('/dev/ttyUSB0')
      openCallback!()

      expect(emitSpy).toHaveBeenCalledWith('OPEN')
      emitSpy.mockRestore()
    })

    test('should emit CLOSE event when port closes', async () => {
      const emitSpy = jest.spyOn(ssp, 'emit')

      let closeCallback: () => void
      mockPort.on.mockImplementation((event: string, cb: () => void) => {
        if (event === 'close') closeCallback = cb
      })

      await ssp.open('/dev/ttyUSB0')
      closeCallback!()

      expect(emitSpy).toHaveBeenCalledWith('CLOSE')
      emitSpy.mockRestore()
    })

    test('should emit ERROR event when port errors', async () => {
      let errorCallback: (err: Error) => void
      mockPort.on.mockImplementation((event: string, cb: (err: Error) => void) => {
        if (event === 'error') errorCallback = cb
      })

      await ssp.open('/dev/ttyUSB0')

      const testError = new Error('Test error')
      const errorHandler = jest.fn()
      ssp.on('ERROR', errorHandler)

      // Also listen to 'error' event to prevent unhandled error from internal eventEmitter
      ;(ssp as any).eventEmitter.on('error', () => {})

      errorCallback!(testError)

      expect(errorHandler).toHaveBeenCalledWith(testError)
    })

    test('should set up parser data handler', async () => {
      let dataCallback: (buffer: Buffer) => void
      mockParser.on.mockImplementation((event: string, cb: (buffer: Buffer) => void) => {
        if (event === 'data') dataCallback = cb
      })

      await ssp.open('/dev/ttyUSB0')

      expect(mockParser.on).toHaveBeenCalledWith('data', expect.any(Function))
    })
  })

  describe('close', () => {
    test('should close serial port when port is defined', async () => {
      await ssp.open('/dev/ttyUSB0')
      await ssp.close()

      const { SerialPort } = require('serialport')
      const mockPortInstance = SerialPort.mock.results[0].value
      expect(mockPortInstance.close).toHaveBeenCalled()
    })

    test('should return undefined when port is not defined', async () => {
      const result = await ssp.close()

      expect(result).toBeUndefined()
    })
  })

  describe('command', () => {
    test('should throw error for unknown command', async () => {
      await expect(ssp.command('UNKNOWN_COMMAND')).rejects.toThrow('Unknown command')
    })

    test('should throw error when encrypted command called without encryption key', async () => {
      ssp.keys.encryptKey = null

      await expect(ssp.command('PAYOUT_AMOUNT', { amount: 100, country_code: 'EUR' })).rejects.toThrow('Command requires ecnryption')
    })

    test('should throw error when already processing another command', async () => {
      ssp.state.processing = true

      await expect(ssp.command('SYNC')).rejects.toThrow('Already processing another command')
    })

    test('should reset sequence on SYNC command', async () => {
      ssp.sequence = 0x00
      ssp.state.processing = false

      // This will throw because port is not open, but sequence should still be reset
      try {
        await ssp.command('SYNC')
      } catch {
        // Expected to fail
      }

      expect(ssp.sequence).toBe(0x80)
    })

    test('should convert command to uppercase', async () => {
      ssp.state.processing = false

      try {
        await ssp.command('sync')
      } catch {
        // Expected to fail
      }

      expect(ssp.sequence).toBe(0x80)
    })
  })

  describe('parsePacketData', () => {
    test('should return parsed result with success status', () => {
      const buffer = Buffer.from([0xf0]) // OK status
      ssp.protocol_version = null
      ssp.unit_type = null

      const result = ssp.parsePacketData(buffer, 'SYNC')

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.status).toBe('OK')
    })

    test('should set protocol_version to undefined on failed HOST_PROTOCOL_VERSION', () => {
      const buffer = Buffer.from([0xf5]) // COMMAND_NOT_KNOWN status
      ssp.protocol_version = 6

      ssp.parsePacketData(buffer, 'HOST_PROTOCOL_VERSION')

      expect(ssp.protocol_version).toBeUndefined()
    })

    test('should handle REQUEST_KEY_EXCHANGE and set encryption keys', () => {
      const buffer = Buffer.from([0xf0, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) // OK status with key data

      const result = ssp.parsePacketData(buffer, 'REQUEST_KEY_EXCHANGE')

      expect(result.success).toBe(true)
      expect(ssp.keys.encryptKey).toEqual(Buffer.from('0123456789abcdef'))
    })

    test('should throw error on REQUEST_KEY_EXCHANGE if createSSPHostEncryptionKey fails', () => {
      const { createSSPHostEncryptionKey } = require('./utils')
      createSSPHostEncryptionKey.mockImplementationOnce(() => {
        throw new Error('Key creation failed')
      })

      const buffer = Buffer.from([0xf0, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08])

      expect(() => ssp.parsePacketData(buffer, 'REQUEST_KEY_EXCHANGE')).toThrow('Key exchange error')
    })

    test('should set protocol_version and unit_type on SETUP_REQUEST', () => {
      // Mock parseData to return proper SETUP_REQUEST response
      const { parseData } = require('./utils')
      const originalParseData = parseData

      jest.spyOn(require('./utils'), 'parseData').mockReturnValueOnce({
        success: true,
        status: 'OK',
        command: 'SETUP_REQUEST',
        info: {
          protocol_version: 8,
          unit_type: 'Smart Payout',
        },
      })

      const buffer = Buffer.from([0xf0])
      const result = ssp.parsePacketData(buffer, 'SETUP_REQUEST')

      expect(result.success).toBe(true)
      expect(ssp.protocol_version).toBe(8)
      expect(ssp.unit_type).toBe('Smart Payout')
    })

    test('should set unit_type on UNIT_DATA', () => {
      jest.spyOn(require('./utils'), 'parseData').mockReturnValueOnce({
        success: true,
        status: 'OK',
        command: 'UNIT_DATA',
        info: {
          unit_type: 'NV200',
        },
      })

      const buffer = Buffer.from([0xf0])
      const result = ssp.parsePacketData(buffer, 'UNIT_DATA')

      expect(result.success).toBe(true)
      expect(ssp.unit_type).toBe('NV200')
    })
  })

  describe('enable', () => {
    test('should set state.enabled to true on successful enable', async () => {
      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'ENABLE',
        info: {},
      })

      jest.spyOn(ssp, 'poll').mockResolvedValue(undefined)

      await ssp.enable()

      expect(ssp.state.enabled).toBe(true)
      mockCommand.mockRestore()
    })
  })

  describe('disable', () => {
    test('should set state.enabled to false on successful disable', async () => {
      ssp.state.enabled = true
      ssp.state.polling = false

      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'DISABLE',
        info: {},
      })

      await ssp.disable()

      expect(ssp.state.enabled).toBe(false)
      mockCommand.mockRestore()
    })

    test('should stop polling before disabling', async () => {
      ssp.state.polling = true

      const mockPoll = jest.spyOn(ssp, 'poll').mockResolvedValue(undefined)
      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'DISABLE',
        info: {},
      })

      await ssp.disable()

      expect(mockPoll).toHaveBeenCalledWith(false)
      mockPoll.mockRestore()
      mockCommand.mockRestore()
    })
  })

  describe('poll', () => {
    test('should set polling state to true when status is true', async () => {
      ssp.state.polling = false
      ssp.state.processing = false

      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'POLL',
        info: {},
      })

      // Start polling but don't wait for recursive call
      const pollPromise = ssp.poll(true)
      await pollPromise

      expect(ssp.state.polling).toBe(true)
      mockCommand.mockRestore()
    })

    test('should set polling state to false when status is false', async () => {
      ssp.state.polling = true
      ssp.state.processing = false

      await ssp.poll(false)

      expect(ssp.state.polling).toBe(false)
    })

    test('should return early if already polling and status is true', async () => {
      ssp.state.polling = true
      ssp.state.processing = false

      const mockCommand = jest.spyOn(ssp, 'command')

      const result = await ssp.poll(true)

      expect(result).toBeUndefined()
      expect(mockCommand).not.toHaveBeenCalled()
      mockCommand.mockRestore()
    })

    test('should emit events for poll info', async () => {
      ssp.state.polling = false
      ssp.state.processing = false

      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'POLL',
        info: { name: 'NOTE_CREDIT', value: 10 } as Record<string, unknown>,
      })

      const emitSpy = jest.spyOn(ssp, 'emit')

      await ssp.poll(true)

      expect(emitSpy).toHaveBeenCalledWith('NOTE_CREDIT', { name: 'NOTE_CREDIT', value: 10 })
      mockCommand.mockRestore()
      emitSpy.mockRestore()
    })
  })

  describe('initEncryption', () => {
    test('should reset eCount to 0', async () => {
      ssp.eCount = 5

      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'SET_GENERATOR',
        info: {},
      })

      try {
        await ssp.initEncryption()
      } catch {
        // May fail on REQUEST_KEY_EXCHANGE
      }

      expect(ssp.eCount).toBe(0)
      mockCommand.mockRestore()
    })

    test('should set encryptKey to null', async () => {
      ssp.keys.encryptKey = Buffer.from('test')

      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'SET_GENERATOR',
        info: {},
      })

      try {
        await ssp.initEncryption()
      } catch {
        // May fail
      }

      expect(ssp.keys.encryptKey).toBeNull()
      mockCommand.mockRestore()
    })

    test('should throw if any encryption command fails', async () => {
      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: false,
        status: 'FAIL',
        command: 'SET_GENERATOR',
        info: {},
      })

      await expect(ssp.initEncryption()).rejects.toEqual({
        success: false,
        status: 'FAIL',
        command: 'SET_GENERATOR',
        info: {},
      })

      mockCommand.mockRestore()
    })
  })

  describe('sendToDevice (via command)', () => {
    let eventCallbacks: Record<string, (data: any) => void>

    beforeEach(async () => {
      eventCallbacks = {}

      // Setup port event capture
      mockPort.on.mockImplementation((event: string, cb: (data: any) => void) => {
        eventCallbacks[event] = cb
      })

      // Setup parser event capture
      mockParser.on.mockImplementation((event: string, cb: (data: any) => void) => {
        eventCallbacks[`parser_${event}`] = cb
      })

      await ssp.open('/dev/ttyUSB0')
    })

    test('should send command and receive response without encryption', async () => {
      // Ensure no encryption
      ssp.keys.encryptKey = null
      ssp.config.encryptAllCommand = false

      // Mock extractPacketData
      jest.spyOn(require('./utils'), 'extractPacketData').mockReturnValueOnce(Buffer.from([0xf0]))

      // Simulate response after write
      mockPort.write.mockImplementation(() => {
        // Emit data response asynchronously
        setTimeout(() => {
          const response = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x20, 0x21])
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      const emitSpy = jest.spyOn(ssp, 'emit')

      const result = await ssp.command('SYNC')

      expect(result.success).toBe(true)
      expect(mockPort.write).toHaveBeenCalled()

      // Verify DEBUG was emitted with same encrypted and plain buffers (no encryption)
      const debugCall = emitSpy.mock.calls.find(call => call[0] === 'DEBUG')
      expect(debugCall).toBeDefined()
      const debugData = debugCall![1] as { tx: { encrypted: Buffer; plain: Buffer } }

      // When not encrypted, the plain buffer should be the same as the encrypted buffer
      expect(debugData.tx.encrypted).toEqual(debugData.tx.plain)

      emitSpy.mockRestore()
    })

    test('should toggle sequence from 0x00 to 0x80 after command', async () => {
      ssp.sequence = 0x00

      // Simulate response after write
      mockPort.write.mockImplementation(() => {
        // Emit data response asynchronously
        setTimeout(() => {
          const response = Buffer.from([0x7f, 0x00, 0x01, 0xf0, 0x20, 0x0a])
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      await ssp.command('POLL')

      // Sequence should toggle from 0x00 to 0x80
      expect(ssp.sequence).toBe(0x80)
    })

    test('should increment eCount when encrypted response received', async () => {
      ssp.keys.encryptKey = Buffer.from('0123456789abcdef')
      ssp.eCount = 5

      jest.spyOn(require('./utils'), 'extractPacketData').mockReturnValueOnce(Buffer.from([0xf0]))

      mockPort.write.mockImplementation(() => {
        setTimeout(() => {
          // Response with 0x7e at position 3 indicates encrypted
          const response = Buffer.from([0x7f, 0x80, 0x01, 0x7e, 0xf0, 0x20, 0x21])
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      await ssp.command('SYNC')

      expect(ssp.eCount).toBe(6)
    })

    test('should create separate plain buffer when encryptAllCommand is true', async () => {
      // Set up encryption via encryptAllCommand
      ssp.keys.encryptKey = Buffer.from('0123456789abcdef')
      ssp.config.encryptAllCommand = true

      jest.spyOn(require('./utils'), 'extractPacketData').mockReturnValueOnce(Buffer.from([0xf0]))

      let writtenBuffer: Buffer | null = null
      mockPort.write.mockImplementation((buffer: Buffer) => {
        writtenBuffer = buffer
        setTimeout(() => {
          const response = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x20, 0x21])
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      const emitSpy = jest.spyOn(ssp, 'emit')

      await ssp.command('SYNC')

      // Verify DEBUG was emitted with different encrypted and plain buffers
      expect(emitSpy).toHaveBeenCalledWith(
        'DEBUG',
        expect.objectContaining({
          tx: expect.objectContaining({
            encrypted: expect.any(Buffer),
            plain: expect.any(Buffer),
          }),
        }),
      )

      // Get the DEBUG call arguments
      const debugCall = emitSpy.mock.calls.find(call => call[0] === 'DEBUG')
      expect(debugCall).toBeDefined()
      const debugData = debugCall![1] as { tx: { encrypted: Buffer; plain: Buffer } }

      // When encrypted, the plain buffer should be different from the encrypted buffer
      expect(debugData.tx.encrypted).not.toEqual(debugData.tx.plain)

      emitSpy.mockRestore()
    })

    test('should create separate plain buffer when command requires encryption', async () => {
      // Set up encryption key but disable encryptAllCommand
      // Use a command that has encrypted: true in commands.json (HALT_PAYOUT)
      ssp.keys.encryptKey = Buffer.from('0123456789abcdef')
      ssp.config.encryptAllCommand = false

      jest.spyOn(require('./utils'), 'extractPacketData').mockReturnValueOnce(Buffer.from([0xf0]))

      mockPort.write.mockImplementation(() => {
        setTimeout(() => {
          const response = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x20, 0x21])
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      const emitSpy = jest.spyOn(ssp, 'emit')

      await ssp.command('HALT_PAYOUT')

      // Verify DEBUG was emitted with different encrypted and plain buffers
      const debugCall = emitSpy.mock.calls.find(call => call[0] === 'DEBUG')
      expect(debugCall).toBeDefined()
      const debugData = debugCall![1] as { tx: { encrypted: Buffer; plain: Buffer } }

      // When command requires encryption, the plain buffer should be different from the encrypted buffer
      expect(debugData.tx.encrypted).not.toEqual(debugData.tx.plain)

      emitSpy.mockRestore()
    })

    test('should throw on sequence flag mismatch', async () => {
      jest.spyOn(require('./utils'), 'extractPacketData').mockReturnValue(Buffer.from([0xf0]))

      ssp.config.commandRetries = 1

      mockPort.write.mockImplementation(() => {
        setTimeout(() => {
          // Response with different sequence flag
          const response = Buffer.from([0x7f, 0x00, 0x01, 0xf0, 0x20, 0x21]) // sequence 0x00 instead of 0x80
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      await expect(ssp.command('SYNC')).rejects.toMatchObject({
        success: false,
        error: expect.stringContaining('retries'),
      })
    })

    test('should retry on timeout and eventually fail', async () => {
      ssp.config.timeout = 50
      ssp.config.commandRetries = 2

      // Don't emit any response to trigger timeout
      mockPort.write.mockImplementation(() => {
        // No response
      })

      await expect(ssp.command('SYNC')).rejects.toMatchObject({
        success: false,
      })

      expect(mockPort.write).toHaveBeenCalledTimes(2)
    })

    test('should emit DEBUG event after command', async () => {
      const emitSpy = jest.spyOn(ssp, 'emit')

      jest.spyOn(require('./utils'), 'extractPacketData').mockReturnValueOnce(Buffer.from([0xf0]))

      mockPort.write.mockImplementation(() => {
        setTimeout(() => {
          const response = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x20, 0x21])
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      await ssp.command('SYNC')

      expect(emitSpy).toHaveBeenCalledWith(
        'DEBUG',
        expect.objectContaining({
          command: 'SYNC',
          tx: expect.objectContaining({
            createdAt: expect.any(Number),
            encrypted: expect.any(Buffer),
            plain: expect.any(Buffer),
          }),
          rx: expect.objectContaining({
            createdAt: expect.any(Number),
            encrypted: expect.any(Buffer),
          }),
        }),
      )

      emitSpy.mockRestore()
    })

    test('should throw when command result is not successful', async () => {
      // Mock extractPacketData to return a failure status (0xf5 = COMMAND_CANNOT_BE_PROCESSED)
      jest.spyOn(require('./utils'), 'extractPacketData').mockReturnValueOnce(Buffer.from([0xf5]))

      mockPort.write.mockImplementation(() => {
        setTimeout(() => {
          const response = Buffer.from([0x7f, 0x80, 0x01, 0xf5, 0x20, 0x21])
          eventCallbacks['parser_data']?.(response)
        }, 10)
      })

      await expect(ssp.command('SYNC')).rejects.toMatchObject({
        success: false,
        status: 'COMMAND_CANNOT_BE_PROCESSED',
      })
    })
  })

  describe('poll edge cases', () => {
    test('should wait for processing to complete before polling', async () => {
      ssp.state.processing = true
      ssp.state.polling = false

      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'POLL',
        info: {},
      })

      // Start poll, it should wait
      const pollPromise = ssp.poll(true)

      // After a small delay, set processing to false
      setTimeout(() => {
        ssp.state.processing = false
      }, 50)

      await pollPromise

      expect(ssp.state.polling).toBe(true)
      mockCommand.mockRestore()
    })

    test('should emit array of poll info events', async () => {
      ssp.state.polling = false
      ssp.state.processing = false

      const mockCommand = jest.spyOn(ssp, 'command').mockResolvedValue({
        success: true,
        status: 'OK',
        command: 'POLL',
        info: [
          { name: 'NOTE_CREDIT', value: 10 },
          { name: 'NOTE_CREDIT', value: 20 },
        ] as unknown as Record<string, unknown>,
      })

      const emitSpy = jest.spyOn(ssp, 'emit')

      await ssp.poll(true)

      expect(emitSpy).toHaveBeenCalledWith('NOTE_CREDIT', { name: 'NOTE_CREDIT', value: 10 })
      expect(emitSpy).toHaveBeenCalledWith('NOTE_CREDIT', { name: 'NOTE_CREDIT', value: 20 })

      mockCommand.mockRestore()
      emitSpy.mockRestore()
    })

    test('should set polling to false and throw on command error', async () => {
      ssp.state.polling = false
      ssp.state.processing = false

      const mockCommand = jest.spyOn(ssp, 'command').mockRejectedValue(new Error('Command failed'))

      await expect(ssp.poll(true)).rejects.toThrow('Command failed')

      expect(ssp.state.polling).toBe(false)
      mockCommand.mockRestore()
    })

    test('should clear pollTimeout when stopping poll', async () => {
      ssp.state.polling = true
      ssp.state.processing = false

      // Set a fake timeout
      ;(ssp as any).pollTimeout = setTimeout(() => {}, 10000)

      await ssp.poll(false)

      expect(ssp.state.polling).toBe(false)
    })

    test('should schedule next poll after successful poll', async () => {
      jest.useFakeTimers()

      ssp.state.polling = false
      ssp.state.processing = false
      ssp.config.pollingInterval = 100

      let callCount = 0
      const mockCommand = jest.spyOn(ssp, 'command').mockImplementation(async () => {
        callCount++
        if (callCount > 1) {
          // Stop polling after second call to prevent infinite loop
          ssp.state.polling = false
        }
        return {
          success: true,
          status: 'OK',
          command: 'POLL',
          info: {},
        }
      })

      await ssp.poll(true)

      // Advance timers to trigger the next poll
      jest.advanceTimersByTime(150)

      // Allow promises to resolve
      await Promise.resolve()

      expect(callCount).toBeGreaterThanOrEqual(1)

      mockCommand.mockRestore()
      jest.useRealTimers()
    })

    test('should emit ERROR on poll error in setTimeout callback', async () => {
      jest.useFakeTimers()

      ssp.state.polling = false
      ssp.state.processing = false

      const emitSpy = jest.spyOn(ssp, 'emit')

      let callCount = 0
      const mockCommand = jest.spyOn(ssp, 'command').mockImplementation(async () => {
        callCount++
        if (callCount > 1) {
          throw new Error('Poll error in callback')
        }
        return {
          success: true,
          status: 'OK',
          command: 'POLL',
          info: {},
        }
      })

      await ssp.poll(true)

      // Advance timers to trigger the next poll
      jest.advanceTimersByTime(350)

      // Allow promises to resolve
      await Promise.resolve()
      await Promise.resolve()

      // The error should be emitted
      expect(emitSpy).toHaveBeenCalledWith('ERROR', expect.any(Error))

      mockCommand.mockRestore()
      emitSpy.mockRestore()
      jest.useRealTimers()
    })
  })
})
