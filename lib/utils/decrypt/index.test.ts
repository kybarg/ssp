import { decrypt } from '.'
import { encrypt } from '../encrypt/encrypt'
import { uInt64LE } from '../uInt64LE/uInt64LE'

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
      decrypt(null as any, encryptedData)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if key is not a Buffer', () => {
    expect(() => {
      decrypt('not a buffer' as any, encryptedData)
    }).toThrow('Key must be a Buffer')
  })

  test('should throw an error if data is not provided', () => {
    expect(() => {
      decrypt(key, null as any)
    }).toThrow('Data must be a Buffer')
  })

  test('should throw an error if data is not a Buffer', () => {
    expect(() => {
      decrypt(key, 'not a buffer' as any)
    }).toThrow('Data must be a Buffer')
  })
})
