const { EventEmitter } = require('node:events')

// Mock dependencies
jest.mock('serialport', () => {
  const { EventEmitter } = require('node:events')

  class MockSerialPort extends EventEmitter {
    constructor(options) {
      super()
      this.path = options.path
      this.options = options
    }

    open(callback) {
      callback(null)
    }

    close(callback) {
      callback(null)
    }

    write() {
      return true
    }

    pipe(parser) {
      this._parser = parser
      return parser
    }
  }

  return { SerialPort: MockSerialPort }
})

jest.mock('./parser/index.js', () => {
  const { EventEmitter } = require('node:events')

  class MockSSPParser extends EventEmitter {
    constructor() {
      super()
    }
  }

  return { SSPParser: MockSSPParser }
})

jest.mock('./utils', () => ({
  argsToByte: jest.fn().mockReturnValue(Buffer.alloc(0)),
  CRC16: jest.fn().mockReturnValue([0x00, 0x00]),
  extractPacketData: jest.fn().mockReturnValue(Buffer.from([0xf0])),
  generateKeys: jest.fn().mockReturnValue({
    generator: 13n,
    modulus: 7n,
    hostRandom: 5n,
    hostInter: 6n,
  }),
  getPacket: jest.fn().mockReturnValue(Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x00, 0x00])),
  parseData: jest.fn().mockReturnValue({ success: true, status: 'OK', info: null }),
  createSSPHostEncryptionKey: jest.fn().mockReturnValue({ encryptKey: Buffer.alloc(16, 0xaa), key: 123n }),
  validateNodeVersion: jest.fn(),
}))

const SSP = require('./index')
const { generateKeys, parseData, createSSPHostEncryptionKey, getPacket, validateNodeVersion } = require('./utils')

describe('SSP', () => {
  let ssp

  beforeEach(() => {
    jest.clearAllMocks()
    ssp = new SSP({})
  })

  describe('constructor', () => {
    test('should call validateNodeVersion', () => {
      expect(validateNodeVersion).toHaveBeenCalled()
    })

    test('should set default config values', () => {
      expect(ssp.config).toEqual({
        encryptAllCommand: true,
        id: 0,
        timeout: 1000,
        commandRetries: 20,
        pollingInterval: 300,
      })
    })

    test('should merge custom config values', () => {
      const custom = new SSP({ id: 5, timeout: 2000, pollingInterval: 500 })
      expect(custom.config).toEqual({
        encryptAllCommand: true,
        id: 5,
        timeout: 2000,
        commandRetries: 20,
        pollingInterval: 500,
      })
    })

    test('should set default fixedKey', () => {
      expect(ssp.keys.fixedKey).toBe('0123456701234567')
    })

    test('should allow custom fixedKey', () => {
      const custom = new SSP({ fixedKey: 'customkey1234567' })
      expect(custom.keys.fixedKey).toBe('customkey1234567')
    })

    test('should not include fixedKey in config', () => {
      expect(ssp.config.fixedKey).toBeUndefined()
    })

    test('should initialize keys with null values', () => {
      expect(ssp.keys.encryptKey).toBeNull()
      expect(ssp.keys.generator).toBeNull()
      expect(ssp.keys.hostInter).toBeNull()
      expect(ssp.keys.hostRandom).toBeNull()
      expect(ssp.keys.key).toBeNull()
      expect(ssp.keys.modulus).toBeNull()
      expect(ssp.keys.slaveInterKey).toBeNull()
    })

    test('should initialize state correctly', () => {
      expect(ssp.state).toEqual({
        enabled: false,
        polling: false,
        processing: false,
      })
    })

    test('should initialize counters and sequence', () => {
      expect(ssp.eCount).toBe(0)
      expect(ssp.sequence).toBe(0x80)
    })

    test('should initialize protocol_version and unit_type as null', () => {
      expect(ssp.protocol_version).toBeNull()
      expect(ssp.unit_type).toBeNull()
    })

    test('should be an instance of EventEmitter', () => {
      expect(ssp).toBeInstanceOf(EventEmitter)
    })
  })

  describe('open', () => {
    test('should open serial port and set up event handlers', async () => {
      await ssp.open('COM3')
      expect(ssp.port).toBeDefined()
      expect(ssp.parser).toBeDefined()
    })

    test('should merge custom serial options', async () => {
      await ssp.open('COM3', { baudRate: 19200 })
      expect(ssp.port.options.baudRate).toBe(19200)
    })

    test('should emit OPEN event when port opens', async () => {
      const spy = jest.fn()
      ssp.on('OPEN', spy)
      await ssp.open('COM3')
      ssp.port.emit('open')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    test('should emit CLOSE event when port closes', async () => {
      const spy = jest.fn()
      ssp.on('CLOSE', spy)
      await ssp.open('COM3')
      ssp.port.emit('close')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    test('should emit ERROR event when port errors', async () => {
      const spy = jest.fn()
      ssp.on('ERROR', spy)
      await ssp.open('COM3')
      // Add error listener to internal eventEmitter to prevent unhandled error
      ssp.eventEmitter.on('error', () => {})
      const error = new Error('port error')
      ssp.port.emit('error', error)
      expect(spy).toHaveBeenCalledWith(error)
    })

    test('should forward parser data to internal eventEmitter', async () => {
      const spy = jest.fn()
      await ssp.open('COM3')
      ssp.eventEmitter.on('DATA', spy)
      const buffer = Buffer.from([0x7f, 0x80, 0x01, 0xf0])
      ssp.parser.emit('data', buffer)
      expect(spy).toHaveBeenCalledWith(buffer)
    })
  })

  describe('close', () => {
    test('should close the port if it exists', async () => {
      await ssp.open('COM3')
      await expect(ssp.close()).resolves.toBeUndefined()
    })

    test('should return undefined if port is not defined', async () => {
      const result = await ssp.close()
      expect(result).toBeUndefined()
    })
  })

  describe('getSequence', () => {
    test('should return id OR-ed with sequence', () => {
      expect(ssp.getSequence()).toBe(0x80)
    })

    test('should include device id', () => {
      const custom = new SSP({ id: 5 })
      expect(custom.getSequence()).toBe(0x85)
    })

    test('should reflect sequence toggle', () => {
      ssp.sequence = 0x00
      expect(ssp.getSequence()).toBe(0x00)
    })
  })

  describe('initEncryption', () => {
    beforeEach(async () => {
      await ssp.open('COM3')
    })

    test('should call generateKeys', async () => {
      // Mock command to return success for all three key exchange commands
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.initEncryption()
      expect(generateKeys).toHaveBeenCalled()
    })

    test('should reset eCount to 0', async () => {
      ssp.eCount = 5
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.initEncryption()
      expect(ssp.eCount).toBe(0)
    })

    test('should reset encryptKey to null', async () => {
      ssp.keys.encryptKey = Buffer.alloc(16)
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.initEncryption()
      // encryptKey is set to null before commands, but might be set by parsePacketData during REQUEST_KEY_EXCHANGE
      // Since we're mocking command directly, it stays null until the command handler sets it
      expect(ssp.keys.encryptKey).toBe(null)
    })

    test('should execute SET_GENERATOR, SET_MODULUS, REQUEST_KEY_EXCHANGE in order', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.initEncryption()
      expect(ssp.command).toHaveBeenCalledTimes(3)
      expect(ssp.command).toHaveBeenNthCalledWith(1, 'SET_GENERATOR', { key: 13n })
      expect(ssp.command).toHaveBeenNthCalledWith(2, 'SET_MODULUS', { key: 7n })
      expect(ssp.command).toHaveBeenNthCalledWith(3, 'REQUEST_KEY_EXCHANGE', { key: 6n })
    })

    test('should throw if SET_GENERATOR fails', async () => {
      const failResult = { success: false, status: 'FAIL' }
      ssp.command = jest.fn().mockResolvedValue(failResult)
      await expect(ssp.initEncryption()).rejects.toEqual(failResult)
    })

    test('should throw if SET_MODULUS fails', async () => {
      const failResult = { success: false, status: 'FAIL' }
      ssp.command = jest.fn().mockResolvedValueOnce({ success: true, status: 'OK' }).mockResolvedValueOnce(failResult)
      await expect(ssp.initEncryption()).rejects.toEqual(failResult)
    })

    test('should throw if REQUEST_KEY_EXCHANGE fails', async () => {
      const failResult = { success: false, status: 'FAIL' }
      ssp.command = jest
        .fn()
        .mockResolvedValueOnce({ success: true, status: 'OK' })
        .mockResolvedValueOnce({ success: true, status: 'OK' })
        .mockResolvedValueOnce(failResult)
      await expect(ssp.initEncryption()).rejects.toEqual(failResult)
    })
  })

  describe('parsePacketData', () => {
    test('should call parseData with correct arguments', () => {
      const buffer = Buffer.from([0xf0])
      ssp.parsePacketData(buffer, 'SYNC')
      expect(parseData).toHaveBeenCalledWith(buffer, 'SYNC', null, null)
    })

    test('should pass protocol_version and unit_type', () => {
      ssp.protocol_version = 6
      ssp.unit_type = 3
      const buffer = Buffer.from([0xf0])
      ssp.parsePacketData(buffer, 'POLL')
      expect(parseData).toHaveBeenCalledWith(buffer, 'POLL', 6, 3)
    })

    test('should handle REQUEST_KEY_EXCHANGE and set keys', () => {
      parseData.mockReturnValueOnce({
        success: true,
        info: { key: [0x01, 0x02, 0x03, 0x04] },
      })

      ssp.parsePacketData(Buffer.from([0xf0]), 'REQUEST_KEY_EXCHANGE')
      expect(createSSPHostEncryptionKey).toHaveBeenCalled()
      expect(ssp.keys.encryptKey).toEqual(Buffer.alloc(16, 0xaa))
    })

    test('should throw error if key exchange fails', () => {
      parseData.mockReturnValueOnce({
        success: true,
        info: { key: [0x01, 0x02] },
      })
      createSSPHostEncryptionKey.mockImplementationOnce(() => {
        throw new Error('key error')
      })

      expect(() => ssp.parsePacketData(Buffer.from([0xf0]), 'REQUEST_KEY_EXCHANGE')).toThrow('Key exchange error')
    })

    test('should set protocol_version and unit_type on SETUP_REQUEST', () => {
      parseData.mockReturnValueOnce({
        success: true,
        info: { protocol_version: 6, unit_type: 3 },
      })

      ssp.parsePacketData(Buffer.from([0xf0]), 'SETUP_REQUEST')
      expect(ssp.protocol_version).toBe(6)
      expect(ssp.unit_type).toBe(3)
    })

    test('should set unit_type on UNIT_DATA', () => {
      parseData.mockReturnValueOnce({
        success: true,
        info: { unit_type: 7 },
      })

      ssp.parsePacketData(Buffer.from([0xf0]), 'UNIT_DATA')
      expect(ssp.unit_type).toBe(7)
    })

    test('should reset protocol_version on failed HOST_PROTOCOL_VERSION', () => {
      ssp.protocol_version = 6
      parseData.mockReturnValueOnce({ success: false })

      ssp.parsePacketData(Buffer.from([0xf0]), 'HOST_PROTOCOL_VERSION')
      expect(ssp.protocol_version).toBeUndefined()
    })

    test('should not reset protocol_version on failed non-HOST_PROTOCOL_VERSION command', () => {
      ssp.protocol_version = 6
      parseData.mockReturnValueOnce({ success: false })

      ssp.parsePacketData(Buffer.from([0xf0]), 'POLL')
      expect(ssp.protocol_version).toBe(6)
    })

    test('should return parsed data', () => {
      const expected = { success: true, status: 'OK', info: null }
      parseData.mockReturnValueOnce(expected)

      const result = ssp.parsePacketData(Buffer.from([0xf0]), 'SYNC')
      expect(result).toEqual(expected)
    })
  })

  describe('enable', () => {
    beforeEach(async () => {
      await ssp.open('COM3')
    })

    test('should send ENABLE command', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.enable()
      expect(ssp.command).toHaveBeenCalledWith('ENABLE')
    })

    test('should set enabled state to true on OK', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.enable()
      expect(ssp.state.enabled).toBe(true)
    })

    test('should start polling if not already polling', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.enable()
      expect(ssp.poll).toHaveBeenCalledWith(true)
    })

    test('should not start polling if already polling', async () => {
      ssp.state.polling = true
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.enable()
      expect(ssp.poll).not.toHaveBeenCalled()
    })

    test('should not set enabled state on non-OK status', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'FAIL' })
      await ssp.enable()
      expect(ssp.state.enabled).toBe(false)
    })
  })

  describe('disable', () => {
    beforeEach(async () => {
      await ssp.open('COM3')
    })

    test('should send DISABLE command', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.disable()
      expect(ssp.command).toHaveBeenCalledWith('DISABLE')
    })

    test('should stop polling if polling is active', async () => {
      ssp.state.polling = true
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.disable()
      expect(ssp.poll).toHaveBeenCalledWith(false)
    })

    test('should not call poll if not polling', async () => {
      ssp.state.polling = false
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.disable()
      expect(ssp.poll).not.toHaveBeenCalled()
    })

    test('should set enabled state to false on OK', async () => {
      ssp.state.enabled = true
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.disable()
      expect(ssp.state.enabled).toBe(false)
    })

    test('should not change enabled state on non-OK status', async () => {
      ssp.state.enabled = true
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'FAIL' })
      ssp.poll = jest.fn().mockResolvedValue()
      await ssp.disable()
      expect(ssp.state.enabled).toBe(true)
    })
  })

  describe('command', () => {
    beforeEach(async () => {
      await ssp.open('COM3')
    })

    test('should throw on unknown command', async () => {
      await expect(ssp.command('NONEXISTENT')).rejects.toThrow('Unknown command')
    })

    test('should convert command to uppercase', async () => {
      ssp.sendToDevice = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.command('sync')
      expect(ssp.sendToDevice).toHaveBeenCalled()
    })

    test('should throw if encrypted command and no encryptKey', async () => {
      ssp.keys.encryptKey = null
      await expect(ssp.command('PAYOUT_AMOUNT', { amount: 100 })).rejects.toThrow('Command requires ecnryption')
    })

    test('should throw if already processing', async () => {
      ssp.state.processing = true
      await expect(ssp.command('SYNC')).rejects.toThrow('Already processing another command')
    })

    test('should reset sequence to 0x80 on SYNC command before sending', async () => {
      ssp.sequence = 0x00
      ssp.sendToDevice = jest.fn(function () {
        // At the time of sending, sequence should have been reset to 0x80
        expect(ssp.getSequence()).toBe(0x80)
        return Promise.resolve({ success: true, status: 'OK' })
      })
      await ssp.command('SYNC')
      // After response, sequence toggles: 0x80 -> 0x00
      expect(ssp.sequence).toBe(0x00)
    })

    test('should toggle sequence after response', async () => {
      ssp.sequence = 0x80
      ssp.sendToDevice = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.command('SYNC')
      expect(ssp.sequence).toBe(0x00)
    })

    test('should toggle sequence from 0x00 to 0x80', async () => {
      ssp.sequence = 0x00
      ssp.sendToDevice = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.command('ENABLE')
      expect(ssp.sequence).toBe(0x80)
    })

    test('should throw result if not success', async () => {
      const failResult = { success: false, status: 'FAIL' }
      ssp.sendToDevice = jest.fn().mockResolvedValue(failResult)
      await expect(ssp.command('SYNC')).rejects.toEqual(failResult)
    })

    test('should call getPacket with encrypted key when encryption is enabled', async () => {
      ssp.keys.encryptKey = Buffer.alloc(16, 0xaa)
      ssp.sendToDevice = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.command('SYNC')
      // getPacket should be called twice - once with encryptKey, once without (for plain)
      expect(getPacket).toHaveBeenCalledTimes(2)
    })

    test('should call getPacket once without encryption', async () => {
      ssp.keys.encryptKey = null
      ssp.sendToDevice = jest.fn().mockResolvedValue({ success: true, status: 'OK' })
      await ssp.command('SYNC')
      expect(getPacket).toHaveBeenCalledTimes(1)
    })
  })

  describe('sendToDevice', () => {
    const txBuffer = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x00, 0x00])
    const txBufferPlain = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x00, 0x00])

    beforeEach(async () => {
      await ssp.open('COM3')
    })

    test('should write buffer to port and return parsed data', async () => {
      const writeSpy = jest.spyOn(ssp.port, 'write')
      const rxBuffer = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x00, 0x00])

      const promise = ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)

      // Simulate device response
      process.nextTick(() => {
        ssp.eventEmitter.emit('DATA', rxBuffer)
      })

      const result = await promise
      expect(writeSpy).toHaveBeenCalledWith(txBuffer)
      expect(result).toEqual({ success: true, status: 'OK', info: null })
    })

    test('should set processing state during execution', async () => {
      const rxBuffer = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x00, 0x00])

      const promise = ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)

      // Check processing state is set
      expect(ssp.state.processing).toBe(true)

      process.nextTick(() => {
        ssp.eventEmitter.emit('DATA', rxBuffer)
      })

      await promise
      // Processing should be unset after completion
      expect(ssp.state.processing).toBe(false)
    })

    test('should emit DEBUG event', async () => {
      const debugSpy = jest.fn()
      ssp.on('DEBUG', debugSpy)
      const rxBuffer = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x00, 0x00])

      const promise = ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)

      process.nextTick(() => {
        ssp.eventEmitter.emit('DATA', rxBuffer)
      })

      await promise
      expect(debugSpy).toHaveBeenCalledTimes(1)
      expect(debugSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'SYNC',
          tx: expect.objectContaining({
            encrypted: txBuffer,
            plain: txBufferPlain,
          }),
        }),
      )
    })

    test('should throw on sequence flag mismatch', async () => {
      ssp.config.commandRetries = 1
      const rxBuffer = Buffer.from([0x7f, 0x00, 0x01, 0xf0, 0x00, 0x00]) // Different sequence

      const promise = ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)

      process.nextTick(() => {
        ssp.eventEmitter.emit('DATA', rxBuffer)
      })

      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          success: false,
        }),
      )
    })

    test('should increment eCount when encrypted response received', async () => {
      ssp.keys.encryptKey = Buffer.alloc(16, 0xaa)
      const rxBuffer = Buffer.from([0x7f, 0x80, 0x02, 0x7e, 0xf0, 0x00, 0x00])

      const promise = ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)

      process.nextTick(() => {
        ssp.eventEmitter.emit('DATA', rxBuffer)
      })

      await promise
      expect(ssp.eCount).toBe(1)
    })

    test('should not increment eCount without encryptKey', async () => {
      ssp.keys.encryptKey = null
      const rxBuffer = Buffer.from([0x7f, 0x80, 0x01, 0xf0, 0x00, 0x00])

      const promise = ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)

      process.nextTick(() => {
        ssp.eventEmitter.emit('DATA', rxBuffer)
      })

      await promise
      expect(ssp.eCount).toBe(0)
    })

    test('should retry on timeout and throw after max retries', async () => {
      ssp.config.commandRetries = 2
      ssp.config.timeout = 50

      await expect(ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)).rejects.toEqual(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('2 retries'),
        }),
      )
    })

    test('should unset processing state even on error', async () => {
      ssp.config.commandRetries = 1
      ssp.config.timeout = 50

      try {
        await ssp.sendToDevice('SYNC', txBuffer, txBufferPlain)
      } catch {
        // expected
      }

      expect(ssp.state.processing).toBe(false)
    })
  })

  describe('poll', () => {
    beforeEach(async () => {
      await ssp.open('COM3')
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
      clearTimeout(ssp.pollTimeout)
    })

    test('should wait for processing to finish before polling', async () => {
      ssp.state.processing = true
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK', info: null })

      const pollPromise = ssp.poll(true)

      // Processing is still true, poll should be waiting
      expect(ssp.command).not.toHaveBeenCalled()

      // Advance timer while processing is still true (covers the false branch of `if (!this.state.processing)`)
      jest.advanceTimersByTime(1)
      expect(ssp.command).not.toHaveBeenCalled()

      // Now unblock processing and advance again
      ssp.state.processing = false
      jest.advanceTimersByTime(1)

      await pollPromise
      expect(ssp.command).toHaveBeenCalledWith('POLL')
    })

    test('should set polling state to true when status is true', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK', info: null })
      await ssp.poll(true)
      expect(ssp.state.polling).toBe(true)
    })

    test('should stop polling when status is false', async () => {
      ssp.state.polling = true
      await ssp.poll(false)
      expect(ssp.state.polling).toBe(false)
    })

    test('should exit early if already polling and status is true', async () => {
      ssp.state.polling = true
      ssp.command = jest.fn()
      await ssp.poll(true)
      expect(ssp.command).not.toHaveBeenCalled()
    })

    test('should send POLL command when polling is enabled', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK', info: null })
      await ssp.poll(true)
      expect(ssp.command).toHaveBeenCalledWith('POLL')
    })

    test('should emit events from poll info array', async () => {
      const infos = [
        { name: 'NOTE_STACKED', channel: 1 },
        { name: 'CREDIT_NOTE', channel: 2 },
      ]
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK', info: infos })

      const stackedSpy = jest.fn()
      const creditSpy = jest.fn()
      ssp.on('NOTE_STACKED', stackedSpy)
      ssp.on('CREDIT_NOTE', creditSpy)

      await ssp.poll(true)
      expect(stackedSpy).toHaveBeenCalledWith(infos[0])
      expect(creditSpy).toHaveBeenCalledWith(infos[1])
    })

    test('should emit event for single (non-array) info', async () => {
      const info = { name: 'DISABLED' }
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK', info })

      const spy = jest.fn()
      ssp.on('DISABLED', spy)

      await ssp.poll(true)
      expect(spy).toHaveBeenCalledWith(info)
    })

    test('should not emit events when info is null', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK', info: null })

      const spy = jest.fn()
      ssp.on('DISABLED', spy)

      await ssp.poll(true)
      expect(spy).not.toHaveBeenCalled()
    })

    test('should schedule next poll with pollingInterval minus execution time', async () => {
      ssp.command = jest.fn().mockResolvedValue({ success: true, status: 'OK', info: null })
      await ssp.poll(true)
      expect(ssp.pollTimeout).toBeDefined()
    })

    test('should recursively call poll from setTimeout callback', async () => {
      let callCount = 0
      ssp.command = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          // Stop polling on second call to prevent infinite loop
          ssp.state.polling = false
        }
        return Promise.resolve({ success: true, status: 'OK', info: null })
      })

      await ssp.poll(true)
      expect(ssp.command).toHaveBeenCalledTimes(1)

      // Trigger the scheduled setTimeout callback
      await jest.advanceTimersByTimeAsync(ssp.config.pollingInterval)

      expect(ssp.command).toHaveBeenCalledTimes(2)
    })

    test('should emit ERROR event when recursive poll throws', async () => {
      const error = new Error('Poll failed')
      let callCount = 0
      ssp.command = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          return Promise.reject(error)
        }
        return Promise.resolve({ success: true, status: 'OK', info: null })
      })

      const errorSpy = jest.fn()
      ssp.on('ERROR', errorSpy)

      await ssp.poll(true)
      expect(ssp.command).toHaveBeenCalledTimes(1)

      // Trigger the scheduled setTimeout callback
      await jest.advanceTimersByTimeAsync(ssp.config.pollingInterval)

      expect(ssp.command).toHaveBeenCalledTimes(2)
      expect(errorSpy).toHaveBeenCalledWith(error)
    })

    test('should stop polling and throw on command error', async () => {
      ssp.command = jest.fn().mockRejectedValue(new Error('Command failed'))

      await expect(ssp.poll(true)).rejects.toThrow('Command failed')
      expect(ssp.state.polling).toBe(false)
    })

    test('should clear pollTimeout when stopping polling', async () => {
      ssp.state.polling = true
      ssp.pollTimeout = setTimeout(() => {}, 10000)
      const clearSpy = jest.spyOn(global, 'clearTimeout')
      await ssp.poll(false)
      expect(clearSpy).toHaveBeenCalled()
      clearSpy.mockRestore()
    })

    test('should not call command when polling is disabled and no status', async () => {
      ssp.state.polling = false
      ssp.command = jest.fn()
      await ssp.poll()
      expect(ssp.command).not.toHaveBeenCalled()
    })
  })
})
