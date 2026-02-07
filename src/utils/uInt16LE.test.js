const uInt16LE = require('./uInt16LE')

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
