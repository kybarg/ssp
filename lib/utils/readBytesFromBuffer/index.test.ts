import { readBytesFromBuffer } from '.'

describe('readBytesFromBuffer', () => {
  test('should return a new Buffer with the specified bytes', () => {
    const buffer = Buffer.from([1, 2, 3, 4, 5])
    const result = readBytesFromBuffer(buffer, 1, 3)
    expect(result).toEqual(Buffer.from([2, 3, 4]))
  })

  test('should throw an error if input is not a Buffer', () => {
    expect(() => {
      readBytesFromBuffer('not a buffer' as any, 0, 3)
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
