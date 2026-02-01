import { stuffBuffer } from '.'

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
