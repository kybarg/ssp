import { encrypt } from '.'
import { uInt64LE } from '../uInt64LE'

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
      encrypt(null as any, data)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if key is not a Buffer', () => {
    expect(() => {
      encrypt('not a buffer' as any, data)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if data is not provided', () => {
    expect(() => {
      encrypt(key, null as any)
    }).toThrow('Data must be a Buffer')
  })

  test('should throw an error if data is not a Buffer', () => {
    expect(() => {
      encrypt(key, 'not a buffer' as any)
    }).toThrow('Data must be a Buffer')
  })
})
