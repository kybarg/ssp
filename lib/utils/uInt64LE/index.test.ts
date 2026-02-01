import { uInt64LE } from '.'

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
      uInt64LE('not a number' as any)
    }).toThrow('Input must be an unsigned 64-bit integer')
  })
})
