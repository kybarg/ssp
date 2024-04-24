const crypto = require('node:crypto')
const semver = require('semver')
const {
  absBigInt,
  argsToByte,
  CRC16,
  createSSPHostEncryptionKey,
  decrypt,
  encrypt,
  extractPacketData,
  generateKeys,
  getPacket,
  randomInt,
  readBytesFromBuffer,
  stuffBuffer,
  uInt16LE,
  uInt32LE,
  uInt64LE,
  validateNodeVersion,
} = require('./utils')
const { engines } = require('../package.json')

// Mocking the chalk module
jest.mock('chalk', () => ({
  red: jest.fn(text => text), // Mocking the red method to return the text as is
}))

describe('absBigInt', () => {
  test('should return 1 for -1', () => {
    const num = BigInt(-1)
    expect(absBigInt(num)).toBe(BigInt(1))
  })

  test('should return 1 for 1', () => {
    const num = BigInt(1)
    expect(absBigInt(num)).toBe(BigInt(1))
  })
})

describe('encrypt', () => {
  const key = Buffer.concat([Buffer.from('0123456701234567', 'hex').swap64(), uInt64LE(23150n)])
  const data = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])

  test('should encrypt data using AES encryption with ECB mode', () => {
    const encryptedData = encrypt(key, data)
    expect(encryptedData).toBeDefined()
    expect(encryptedData).toBeInstanceOf(Buffer)
    expect(encryptedData.length).toBeGreaterThan(0)
    expect(encryptedData).not.toEqual(data) // Encrypted data should not be the same as original data
  })

  test('should throw an error if key is not provided', () => {
    expect(() => {
      encrypt(null, data)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if key is not a Buffer', () => {
    expect(() => {
      encrypt('not a buffer', data)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if data is not provided', () => {
    expect(() => {
      encrypt(key, null)
    }).toThrow('Data must be a Buffer')
  })

  test('should throw an error if data is not a Buffer', () => {
    expect(() => {
      encrypt(key, 'not a buffer')
    }).toThrow('Data must be a Buffer')
  })
})

describe('decrypt', () => {
  const key = Buffer.concat([Buffer.from('0123456701234567', 'hex').swap64(), uInt64LE(23150n)])
  const data = Buffer.from([134, 163, 14, 111, 155, 193, 109, 210, 180, 37, 128, 45, 45, 157, 68, 152])

  // Encrypt the original data to get the encrypted data
  const encryptedData = encrypt(key, data)

  test('should decrypt data using AES decryption with ECB mode', () => {
    const decryptedData = decrypt(key, encryptedData)
    expect(decryptedData).toBeDefined()
    expect(decryptedData).toBeInstanceOf(Buffer)
    expect(decryptedData.length).toBeGreaterThan(0)
    expect(decryptedData).toEqual(data) // Decrypted data should be the same as original data
  })

  test('should throw an error if key is not provided', () => {
    expect(() => {
      decrypt(null, encryptedData)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if key is not a Buffer', () => {
    expect(() => {
      decrypt('not a buffer', encryptedData)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if data is not provided', () => {
    expect(() => {
      decrypt(key, null)
    }).toThrow('Data must be a Buffer')
  })

  test('should throw an error if data is not a Buffer', () => {
    expect(() => {
      decrypt(key, 'not a buffer')
    }).toThrow('Data must be a Buffer')
  })
})

describe('readBytesFromBuffer', () => {
  test('should return a new Buffer with the specified bytes', () => {
    const buffer = Buffer.from([1, 2, 3, 4, 5])
    const result = readBytesFromBuffer(buffer, 1, 3)
    expect(result).toEqual(Buffer.from([2, 3, 4]))
  })

  test('should throw an error if input is not a Buffer', () => {
    expect(() => {
      readBytesFromBuffer('not a buffer', 0, 3)
    }).toThrow('Input must be a Buffer object')
  })

  test('should throw an error if start index is negative', () => {
    const buffer = Buffer.from([1, 2, 3])
    expect(() => {
      readBytesFromBuffer(buffer, -1, 2)
    }).toThrow('Invalid start index')
  })

  test('should throw an error if start index is greater than buffer length', () => {
    const buffer = Buffer.from([1, 2, 3])
    expect(() => {
      readBytesFromBuffer(buffer, 4, 2)
    }).toThrow('Invalid start index')
  })

  test('should throw an error if length is negative', () => {
    const buffer = Buffer.from([1, 2, 3])
    expect(() => {
      readBytesFromBuffer(buffer, 0, -2)
    }).toThrow('Invalid length or exceeds buffer size')
  })

  test('should throw an error if length exceeds buffer size', () => {
    const buffer = Buffer.from([1, 2, 3])
    expect(() => {
      readBytesFromBuffer(buffer, 0, 4)
    }).toThrow('Invalid length or exceeds buffer size')
  })

  test('should handle reading from an empty buffer', () => {
    const buffer = Buffer.from([])
    expect(() => {
      readBytesFromBuffer(buffer, 0, 1)
    }).toThrow('Invalid start index')
  })

  test('should handle reading zero length from buffer', () => {
    const buffer = Buffer.from([1, 2, 3])
    const result = readBytesFromBuffer(buffer, 0, 0)
    expect(result).toEqual(Buffer.from([]))
  })
})

describe('randomInt', () => {
  test('should return random int', () => {
    const int = randomInt(10, 100)

    expect(typeof int).toBe('number')
    expect(int >= 10).toBeTruthy()
    expect(int <= 100).toBeTruthy()
  })
})

describe('CRC16', () => {
  it('calculates CRC16 correctly for an empty string', () => {
    expect(CRC16([])).toEqual(Buffer.from([255, 255]))
  })

  it('calculates CRC16 correctly for a single character string', () => {
    expect(CRC16([65])).toEqual(Buffer.from([132, 252]))
  })

  it('calculates CRC16 correctly for a multiple character string', () => {
    expect(CRC16([65, 66, 67])).toEqual(Buffer.from([155, 6]))
  })

  it('calculates CRC16 correctly for a large string', () => {
    expect(CRC16([65, 65, 65, 65, 65, 65, 65, 65])).toEqual(Buffer.from([232, 166]))
  })

  it('calculates CRC16 correctly for a Buffer input', () => {
    const buffer = Buffer.from('ABCD', 'utf-8')
    expect(CRC16(buffer)).toEqual(Buffer.from([140, 154]))
  })
})

describe('uInt64LE', () => {
  test('should return a Buffer representing the given unsigned 64-bit integer in little-endian format', () => {
    const number = 12345678901234567890n
    const result = uInt64LE(number)
    expect(result).toBeDefined()
    expect(result).toBeInstanceOf(Buffer)
    expect(result).toHaveLength(8)
    expect(result.readBigUInt64LE()).toBe(number)
  })

  test('should throw an error if input is not an unsigned 64-bit integer', () => {
    expect(() => {
      uInt64LE(-1)
    }).toThrow('Input must be an unsigned 64-bit integer')

    expect(() => {
      uInt64LE(18446744073709551616n)
    }).toThrow('Input must be an unsigned 64-bit integer')

    expect(() => {
      uInt64LE('not a number')
    }).toThrow('Input must be an unsigned 64-bit integer')
  })
})

describe('uInt32LE', () => {
  test('should return a Buffer representing the given unsigned 32-bit integer in little-endian format', () => {
    const number = 1234567890
    const result = uInt32LE(number)
    expect(result).toBeDefined()
    expect(result).toBeInstanceOf(Buffer)
    expect(result).toHaveLength(4)
    expect(result.readUInt32LE()).toBe(number)
  })

  test('should throw an error if input is not an unsigned 32-bit integer', () => {
    expect(() => {
      uInt32LE(-1)
    }).toThrow('Input must be an unsigned 32-bit integer')

    expect(() => {
      uInt32LE(4294967296)
    }).toThrow('Input must be an unsigned 32-bit integer')

    expect(() => {
      uInt32LE('not a number')
    }).toThrow('Input must be an unsigned 32-bit integer')
  })
})

describe('uInt16LE', () => {
  test('should return a Buffer representing the given unsigned 16-bit integer in little-endian format', () => {
    const number = 1234
    const result = uInt16LE(number)
    expect(result).toBeDefined()
    expect(result).toBeInstanceOf(Buffer)
    expect(result).toHaveLength(2)
    expect(result.readUInt16LE()).toBe(number)
  })

  test('should throw an error if input is not an unsigned 16-bit integer', () => {
    expect(() => {
      uInt16LE(-1)
    }).toThrow('Input must be an unsigned 16-bit integer')

    expect(() => {
      uInt16LE(65536)
    }).toThrow('Input must be an unsigned 16-bit integer')

    expect(() => {
      uInt16LE('not a number')
    }).toThrow('Input must be an unsigned 16-bit integer')
  })
})

describe('argsToByte function', () => {
  test('SET_GENERATOR', () => {
    const result = argsToByte('SET_GENERATOR', { key: 982451653 }, 6)
    expect(result).toEqual(Buffer.from([0xc5, 0x05, 0x8f, 0x3a, 0x00, 0x00, 0x00, 0x00]))
  })

  test('SET_MODULUS', () => {
    const result = argsToByte('SET_MODULUS', { key: 1287821 }, 6)
    expect(result).toEqual(Buffer.from([0x8d, 0xa6, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00]))
  })

  test('REQUEST_KEY_EXCHANGE', () => {
    const result = argsToByte('REQUEST_KEY_EXCHANGE', { key: 7554354432121 }, 6)
    expect(result).toEqual(Buffer.from([0x79, 0xc8, 0x9c, 0xe2, 0xde, 0x06, 0x00, 0x00]))
  })

  test('SET_DENOMINATION_ROUTE: protocol < 6', () => {
    const result = argsToByte('SET_DENOMINATION_ROUTE', { route: 'cashbox', value: 10 }, 5)
    expect(result).toEqual(Buffer.from([0x01, 0x0a, 0x00, 0x00, 0x00]))
  })

  test('SET_DENOMINATION_ROUTE: protocol < 6, hopper', () => {
    const result = argsToByte('SET_DENOMINATION_ROUTE', { route: 'cashbox', value: 10, isHopper: true }, 5)
    expect(result).toEqual(Buffer.from([0x01, 0x0a, 0x00]))
  })

  test('SET_DENOMINATION_ROUTE: protocol >= 6', () => {
    const result = argsToByte('SET_DENOMINATION_ROUTE', { route: 'payout', value: 10, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('SET_CHANNEL_INHIBITS', () => {
    const result = argsToByte('SET_CHANNEL_INHIBITS', { channels: [1, 1, 1, 0, 0, 0] }, 6)
    expect(result).toEqual(Buffer.from([0x07, 0x00]))
  })

  test('SET_COIN_MECH_GLOBAL_INHIBIT: enable', () => {
    const result = argsToByte('SET_COIN_MECH_GLOBAL_INHIBIT', { enable: true }, 6)
    expect(result).toEqual(Buffer.from([0x01]))
  })

  test('SET_COIN_MECH_GLOBAL_INHIBIT: disable', () => {
    const result = argsToByte('SET_COIN_MECH_GLOBAL_INHIBIT', { enable: false }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('SET_HOPPER_OPTIONS: 1', () => {
    const result = argsToByte('SET_HOPPER_OPTIONS', { payMode: 0, levelCheck: false, motorSpeed: 1, cashBoxPayActive: false }, 6)
    expect(result).toEqual(Buffer.from([0x04, 0x00]))
  })

  test('SET_HOPPER_OPTIONS: 2', () => {
    const result = argsToByte('SET_HOPPER_OPTIONS', { payMode: 1, levelCheck: true, motorSpeed: 0, cashBoxPayActive: true }, 6)
    expect(result).toEqual(Buffer.from([0x0b, 0x00]))
  })

  test('GET_DENOMINATION_ROUTE: protocol < 6', () => {
    const result = argsToByte('GET_DENOMINATION_ROUTE', { value: 500 }, 5)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00]))
  })

  test('GET_DENOMINATION_ROUTE: hopper, protocol < 6', () => {
    const result = argsToByte('GET_DENOMINATION_ROUTE', { value: 500, isHopper: true }, 5)
    expect(result).toEqual(Buffer.from([0xf4, 0x01]))
  })

  test('GET_DENOMINATION_ROUTE: protocol >= 6', () => {
    const result = argsToByte('GET_DENOMINATION_ROUTE', { value: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('SET_DENOMINATION_LEVEL: protocol < 6', () => {
    const result = argsToByte('SET_DENOMINATION_LEVEL', { value: 20, denomination: 50 }, 5)
    expect(result).toEqual(Buffer.from([0x14, 0x00, 0x32, 0x00]))
  })

  test('SET_DENOMINATION_LEVEL: protocol >= 6', () => {
    const result = argsToByte('SET_DENOMINATION_LEVEL', { value: 12, denomination: 100, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x0c, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('SET_REFILL_MODE: on', () => {
    const result = argsToByte('SET_REFILL_MODE', { mode: 'on' }, 6)
    expect(result).toEqual(Buffer.from([0x05, 0x81, 0x10, 0x11, 0x01]))
  })

  test('SET_REFILL_MODE: off', () => {
    const result = argsToByte('SET_REFILL_MODE', { mode: 'off' }, 6)
    expect(result).toEqual(Buffer.from([0x05, 0x81, 0x10, 0x11, 0x00]))
  })

  test('SET_REFILL_MODE: get', () => {
    const result = argsToByte('SET_REFILL_MODE', { mode: 'get' }, 6)
    expect(result).toEqual(Buffer.from([0x05, 0x81, 0x10, 0x01]))
  })

  test('HOST_PROTOCOL_VERSION', () => {
    const result = argsToByte('HOST_PROTOCOL_VERSION', { version: 6 }, 6)
    expect(result).toEqual(Buffer.from([0x06]))
  })

  test('SET_BAR_CODE_CONFIGURATION', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', { enable: 'both', numChar: 18 }, 6)
    expect(result).toEqual(Buffer.from([0x03, 0x01, 0x12]))
  })

  test('SET_BAR_CODE_CONFIGURATION: bound low', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', { enable: 'top', numChar: 5 }, 6)
    expect(result).toEqual(Buffer.from([0x01, 0x01, 0x06]))
  })

  test('SET_BAR_CODE_CONFIGURATION: bound up', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', { enable: 'bottom', numChar: 30 }, 6)
    expect(result).toEqual(Buffer.from([0x02, 0x01, 0x18]))
  })

  test('SET_BAR_CODE_CONFIGURATION: none', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', {}, 6)
    expect(result).toEqual(Buffer.from([0x00, 0x01, 0x06]))
  })

  test('SET_BAR_CODE_INHIBIT_STATUS', () => {
    const result = argsToByte('SET_BAR_CODE_INHIBIT_STATUS', { currencyRead: true, barCode: true }, 6)
    expect(result).toEqual(Buffer.from([0xff]))
  })

  test('SET_BAR_CODE_INHIBIT_STATUS: turned off', () => {
    const result = argsToByte('SET_BAR_CODE_INHIBIT_STATUS', { currencyRead: false, barCode: false }, 6)
    expect(result).toEqual(Buffer.from([0xfc]))
  })

  test('PAYOUT_AMOUNT: protocol < 6', () => {
    const result = argsToByte('PAYOUT_AMOUNT', { amount: 500 }, 4)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00]))
  })

  test('PAYOUT_AMOUNT: protocol >= 6', () => {
    const result = argsToByte('PAYOUT_AMOUNT', { amount: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52, 0x58]))
  })

  test('PAYOUT_AMOUNT: protocol >= 6, test', () => {
    const result = argsToByte('PAYOUT_AMOUNT', { test: true, amount: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52, 0x19]))
  })

  test('GET_DENOMINATION_LEVEL: protocol < 6', () => {
    const result = argsToByte('GET_DENOMINATION_LEVEL', { amount: 10 }, 5)
    expect(result).toEqual(Buffer.from([0x0a, 0x00, 0x00, 0x00]))
  })

  test('GET_DENOMINATION_LEVEL: protocol >= 6', () => {
    const result = argsToByte('GET_DENOMINATION_LEVEL', { amount: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('FLOAT_AMOUNT: protocol < 6', () => {
    const result = argsToByte('FLOAT_AMOUNT', { min_possible_payout: 50, amount: 10000 }, 5)
    expect(result).toEqual(Buffer.from([0x32, 0x00, 0x10, 0x27, 0x00, 0x00]))
  })

  test('FLOAT_AMOUNT: protocol >= 6', () => {
    const result = argsToByte('FLOAT_AMOUNT', { min_possible_payout: 50, amount: 10000, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x32, 0x00, 0x10, 0x27, 0x00, 0x00, 0x45, 0x55, 0x52, 0x58]))
  })

  test('FLOAT_AMOUNT: protocol >= 6, test', () => {
    const result = argsToByte('FLOAT_AMOUNT', { test: true, min_possible_payout: 50, amount: 10000, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x32, 0x00, 0x10, 0x27, 0x00, 0x00, 0x45, 0x55, 0x52, 0x19]))
  })

  test('SET_COIN_MECH_INHIBITS: protocol < 6', () => {
    const result = argsToByte('SET_COIN_MECH_INHIBITS', { inhibited: true, amount: 100 }, 5)
    expect(result).toEqual(Buffer.from([0x00, 0x64, 0x00]))
  })

  test('SET_COIN_MECH_INHIBITS: protocol >= 6', () => {
    const result = argsToByte('SET_COIN_MECH_INHIBITS', { inhibited: false, amount: 50, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x01, 0x32, 0x00, 0x45, 0x55, 0x52]))
  })

  test('FLOAT_BY_DENOMINATION', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('FLOAT_BY_DENOMINATION', { value }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x58,
      ]),
    )
  })

  test('FLOAT_BY_DENOMINATION: test', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('FLOAT_BY_DENOMINATION', { value, test: true }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x19,
      ]),
    )
  })

  test('PAYOUT_BY_DENOMINATION', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('PAYOUT_BY_DENOMINATION', { value }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x58,
      ]),
    )
  })

  test('PAYOUT_BY_DENOMINATION: test', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('PAYOUT_BY_DENOMINATION', { value, test: true }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x19,
      ]),
    )
  })

  test('SET_VALUE_REPORTING_TYPE: channel', () => {
    const result = argsToByte('SET_VALUE_REPORTING_TYPE', { reportBy: 'channel' }, 6)
    expect(result).toEqual(Buffer.from([0x01]))
  })

  test('SET_VALUE_REPORTING_TYPE: value', () => {
    const result = argsToByte('SET_VALUE_REPORTING_TYPE', { reportBy: 'value' }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('SET_BAUD_RATE: 9600', () => {
    const result = argsToByte('SET_BAUD_RATE', { baudrate: 9600, reset_to_default_on_reset: true }, 6)
    expect(result).toEqual(Buffer.from([0x00, 0x00]))
  })

  test('SET_BAUD_RATE: 38400', () => {
    const result = argsToByte('SET_BAUD_RATE', { baudrate: 38400, reset_to_default_on_reset: true }, 6)
    expect(result).toEqual(Buffer.from([0x01, 0x00]))
  })

  test('SET_BAUD_RATE: 115200', () => {
    const result = argsToByte('SET_BAUD_RATE', { baudrate: 115200, reset_to_default_on_reset: false }, 6)
    expect(result).toEqual(Buffer.from([0x02, 0x01]))
  })

  test('CONFIGURE_BEZEL: non volatile', () => {
    const result = argsToByte('CONFIGURE_BEZEL', { RGB: 'FF0000', volatile: false }, 6)
    expect(result).toEqual(Buffer.from([0xff, 0x00, 0x00, 0x01]))
  })

  test('CONFIGURE_BEZEL: volatile', () => {
    const result = argsToByte('CONFIGURE_BEZEL', { RGB: 'FF0000', volatile: true }, 6)
    expect(result).toEqual(Buffer.from([0xff, 0x00, 0x00, 0x00]))
  })

  test('ENABLE_PAYOUT_DEVICE: nv11', () => {
    const result = argsToByte('ENABLE_PAYOUT_DEVICE', { GIVE_VALUE_ON_STORED: true, NO_HOLD_NOTE_ON_PAYOUT: true }, 6)
    expect(result).toEqual(Buffer.from([0x03]))
  })

  test('ENABLE_PAYOUT_DEVICE: SMART Payout', () => {
    const result = argsToByte('ENABLE_PAYOUT_DEVICE', { REQUIRE_FULL_STARTUP: false, OPTIMISE_FOR_PAYIN_SPEED: false }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('SET_FIXED_ENCRYPTION_KEY', () => {
    const result = argsToByte('SET_FIXED_ENCRYPTION_KEY', { fixedKey: '0123456701234567' }, 6)
    expect(result).toEqual(Buffer.from([0x67, 0x45, 0x23, 0x01, 0x67, 0x45, 0x23, 0x01]))
  })

  test('COIN_MECH_OPTIONS', () => {
    const result = argsToByte('COIN_MECH_OPTIONS', { ccTalk: false }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('COIN_MECH_OPTIONS: ccTalk', () => {
    const result = argsToByte('COIN_MECH_OPTIONS', { ccTalk: true }, 6)
    expect(result).toEqual(Buffer.from([0x01]))
  })

  test('empty if no args', () => {
    const result = argsToByte('RANDOM_COMMAND_TEST', undefined, 6)
    expect(result).toEqual(Buffer.alloc(0))
  })

  test('empty if unknown command', () => {
    const result = argsToByte('RANDOM_COMMAND_TEST', { param: true }, 6)
    expect(result).toEqual(Buffer.alloc(0))
  })

  describe('stuffBuffer', () => {
    it('should stuff bytes in buffer according to the requirements', () => {
      const inputBuffer = Buffer.from([1, 2, 0x7f, 3, 0x7f, 4])
      const expectedBuffer = Buffer.from([1, 2, 0x7f, 0x7f, 3, 0x7f, 0x7f, 4])

      expect(stuffBuffer(inputBuffer)).toEqual(expectedBuffer)
    })

    it('should not modify buffer if no bytes with value 0x7f are found', () => {
      const inputBuffer = Buffer.from([1, 2, 3, 4])
      const expectedBuffer = Buffer.from([1, 2, 3, 4])

      expect(stuffBuffer(inputBuffer)).toEqual(expectedBuffer)
    })

    it('should return empty buffer when input buffer is empty', () => {
      const inputBuffer = Buffer.alloc(0)
      const expectedBuffer = Buffer.alloc(0)

      expect(stuffBuffer(inputBuffer)).toEqual(expectedBuffer)
    })

    it('should correctly handle buffer with all bytes as 0x7f', () => {
      const inputBuffer = Buffer.from([0x7f, 0x7f, 0x7f])
      const expectedBuffer = Buffer.from([0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f])

      expect(stuffBuffer(inputBuffer)).toEqual(expectedBuffer)
    })
  })
})

describe('validateNodeVersion', () => {
  let originalEnginesNode

  beforeEach(() => {
    originalEnginesNode = engines.node
  })

  afterEach(() => {
    engines.node = originalEnginesNode
  })

  test('should not throw error when Node.js version satisfies the required version', () => {
    engines.node = process.version.replace('v', '>=')

    // Mocking the semver.satisfies function
    const mockSatisfies = jest.spyOn(semver, 'satisfies').mockReturnValue(true)

    expect(() => {
      validateNodeVersion()
    }).not.toThrow()

    // Restore the original function
    mockSatisfies.mockRestore()
  })

  test('should throw error when Node.js version does not satisfy the required version', () => {
    engines.node = process.version.replace('v', '<')

    // Mocking the semver.satisfies function
    const mockSatisfies = jest.spyOn(semver, 'satisfies').mockReturnValue(false)

    expect(() => {
      validateNodeVersion()
    }).toThrow()

    // Restore the original function
    mockSatisfies.mockRestore()
  })
})

describe('extractPacketData', () => {
  const encryptKey = Buffer.from('67452301674523019565000000000000', 'hex')
  const count = 0

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('extracts data from a valid packet buffer', () => {
    const buffer = Buffer.from([0x7f, 0x80, 0x09, 0xf0, 0x27, 0x3b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc7, 0xea])
    const expectedData = Buffer.from([0xf0, 0x27, 0x3b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])

    const result = extractPacketData(buffer, null, count)

    expect(result).toEqual(expectedData)
    expect(require('chalk').red).not.toHaveBeenCalled()
  })

  test('extracts and decrypts data from an encrypted packet buffer', () => {
    const buffer = Buffer.from([
      0x7f, 0x00, 0x11, 0x7e, 0x70, 0x2f, 0xfe, 0x1d, 0x41, 0x19, 0x44, 0xad, 0xda, 0xd1, 0xdf, 0xd6, 0x77, 0xf5, 0x33, 0xcc, 0x63, 0x1d,
    ])
    const expectedData = Buffer.from([0xf0, 0x00, 0x4a, 0x78, 0xb4])

    const result = extractPacketData(buffer, encryptKey, count, true)

    expect(result).toEqual(expectedData)
    expect(require('chalk').red).toHaveBeenCalled()
  })

  test('throws error for unknown response', () => {
    const buffer = Buffer.from([0x01, 0x02, 0x03])

    expect(() => extractPacketData(buffer, null, count)).toThrow('Unknown response')
  })

  test('throws error for wrong CRC16', () => {
    const buffer = Buffer.from([
      0x7f, 0x00, 0x11, 0x7e, 0x70, 0x2f, 0xfe, 0x1d, 0x41, 0x19, 0x44, 0xad, 0xda, 0xd1, 0xdf, 0xd6, 0x77, 0xf5, 0x33, 0xcc, 0x63, 0xff,
    ])

    expect(() => extractPacketData(buffer, null, count)).toThrow('Wrong CRC16')
  })

  test('throws error for encrypted counter mismatch', () => {
    const buffer = Buffer.from([
      0x7f, 0x00, 0x11, 0x7e, 0x70, 0x2f, 0xfe, 0x1d, 0x41, 0x19, 0x44, 0xad, 0xda, 0xd1, 0xdf, 0xd6, 0x77, 0xf5, 0x33, 0xcc, 0x63, 0x1d,
    ])
    const count = 1

    expect(() => extractPacketData(buffer, encryptKey, count)).toThrow('Encrypted counter mismatch')
  })
})

describe('generateKeys function', () => {
  let originalGeneratePrimeSync
  let originalRandomBytes

  beforeEach(() => {
    originalGeneratePrimeSync = crypto.generatePrime
    originalRandomBytes = crypto.randomBytes
  })

  afterEach(() => {
    crypto.generatePrimeSync = originalGeneratePrimeSync
    crypto.randomBytes = originalRandomBytes
  })

  test('should return an object with the expected properties', () => {
    const keys = generateKeys()
    expect(keys).toEqual(
      expect.objectContaining({
        generator: expect.any(BigInt),
        modulus: expect.any(BigInt),
        hostRandom: expect.any(BigInt),
        hostInter: expect.any(BigInt),
      }),
    )
  })

  test('should swap generator and modulus in case generator < modulus', () => {
    crypto.generatePrimeSync = jest.fn().mockReturnValueOnce(7n).mockReturnValueOnce(13n)

    const keys = generateKeys()
    expect(keys.generator).toEqual(13n)
    expect(keys.modulus).toEqual(7n)
  })

  test('should throw an error if either generator or modulus is zero', () => {
    crypto.generatePrimeSync = jest.fn().mockReturnValueOnce(0n)

    expect(generateKeys).toThrow('GENERATOR and MODULUS should be > 0')
  })

  test('should correctly calculate the hostInter value', () => {
    crypto.randomBytes = jest.fn().mockReturnValueOnce(Buffer.from([1, 2]))
    crypto.generatePrimeSync = jest.fn().mockReturnValueOnce(13n).mockReturnValueOnce(7n)

    // Calculating the expected hostInter value manually
    const hostRandom = 513n
    const generator = 13n
    const modulus = 7n
    const expectedHostInter = generator ** hostRandom % modulus

    const keys = generateKeys()
    expect(keys.hostInter).toEqual(expectedHostInter)
  })
})

// Your updated test suite
describe('getPacket', () => {
  // let originalGeneratePrimeSync
  let originalRandomBytes

  beforeEach(() => {
    // originalGeneratePrimeSync = crypto.generatePrime
    originalRandomBytes = crypto.randomBytes
  })

  afterEach(() => {
    // crypto.generatePrimeSync = originalGeneratePrimeSync
    crypto.randomBytes = originalRandomBytes
  })

  const key = Buffer.from('674523016745230137dd000000000000', 'hex')

  test('throws error when args are missing for a command that requires them', () => {
    const args = Buffer.from([])
    const sequence = 1

    expect(() => getPacket('SET_CHANNEL_INHIBITS', args, sequence)).toThrow('Args missings')
  })

  test('throws error when encryption key is missing for a command that requires encryption', () => {
    const args = Buffer.from([1, 2, 3])
    const sequence = 1

    expect(() => getPacket('PAYOUT_AMOUNT', args, sequence)).toThrow('Command requires ecnryption')
  })

  test('generates packet with encrypted data when encryption key is provided', () => {
    const args = argsToByte('SET_CHANNEL_INHIBITS', { channels: Array(5).fill(1) }, 6)
    const sequence = 1
    const count = 1

    const result = getPacket('SET_CHANNEL_INHIBITS', args, sequence, key, count)
    expect(result).toBeDefined()
  })

  test('generates packet without encryption when encryption key is not provided', () => {
    const sequence = 1
    const result = getPacket('RESET', Buffer.from([]), sequence)
    expect(result).toBeDefined()
  })

  test('generates packet with encrypted data for PAYOUT_AMOUNT command when encryption key is provided', () => {
    const args = argsToByte('PAYOUT_AMOUNT', { amount: 5, country_code: 'EUR' }, 6)
    const sequence = 1
    const count = 1

    const result = getPacket('PAYOUT_AMOUNT', args, sequence, key, count)
    expect(result).toBeDefined() // Assert whatever you expect from the result
  })

  test('throws error when encryption key is missing for PAYOUT_AMOUNT command that requires encryption', () => {
    const args = argsToByte('PAYOUT_AMOUNT', { amount: 5, country_code: 'EUR' }, 6)
    const sequence = 1
    const count = 1

    expect(() => getPacket('PAYOUT_AMOUNT', args, sequence, null, count)).toThrow('Command requires ecnryption')
  })
})

describe('createSSPHostEncryptionKey', () => {
  // Test case 1: Test with sample values
  test('should create SSP host encryption key correctly', () => {
    const buffer = Buffer.from('0123456789abcdef', 'hex') // Sample buffer
    const keys = {
      fixedKey: '0123456789abcdef', // Sample fixed key
      hostRandom: 12152n, // Sample host random value
      modulus: 50459n, // Sample modulus value
    }
    const result = createSSPHostEncryptionKey(buffer, keys)
    expect(result).toHaveProperty('slaveInterKey')
    expect(result).toHaveProperty('key')
    expect(result).toHaveProperty('encryptKey')
    expect(typeof result.slaveInterKey).toBe('bigint')
    expect(typeof result.key).toBe('bigint')
    expect(result.encryptKey).toBeInstanceOf(Buffer)
  })

  // Test case 2: Test with zero values
  test('should handle zero values correctly', () => {
    const buffer = Buffer.alloc(8) // Empty buffer
    const keys = {
      fixedKey: '0000000000000000', // Zero fixed key
      hostRandom: 0n, // Zero host random value
      modulus: 50459n, // Sample modulus value
    }
    const result = createSSPHostEncryptionKey(buffer, keys)
    expect(result).toHaveProperty('slaveInterKey')
    expect(result).toHaveProperty('key')
    expect(result).toHaveProperty('encryptKey')
    expect(typeof result.slaveInterKey).toBe('bigint')
    expect(typeof result.key).toBe('bigint')
    expect(result.encryptKey).toBeInstanceOf(Buffer)
  })
})
