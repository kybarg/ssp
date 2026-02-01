import { createSSPHostEncryptionKey } from '.'

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
