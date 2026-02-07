const uInt32LE = require('./uInt32LE')

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
