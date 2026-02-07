const createSSPHostEncryptionKey = require('./createSSPHostEncryptionKey')

describe('createSSPHostEncryptionKey', () => {
  test('should create SSP host encryption key correctly', () => {
    const buffer = Buffer.from('0123456789abcdef', 'hex')
    const keys = {
      fixedKey: '0123456789abcdef',
      hostRandom: 12152n,
      modulus: 50459n,
    }
    const result = createSSPHostEncryptionKey(buffer, keys)
    expect(result).toHaveProperty('slaveInterKey')
    expect(result).toHaveProperty('key')
    expect(result).toHaveProperty('encryptKey')
    expect(typeof result.slaveInterKey).toBe('bigint')
    expect(typeof result.key).toBe('bigint')
    expect(result.encryptKey).toBeInstanceOf(Buffer)
  })

  test('should handle zero values correctly', () => {
    const buffer = Buffer.alloc(8)
    const keys = {
      fixedKey: '0000000000000000',
      hostRandom: 0n,
      modulus: 50459n,
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
