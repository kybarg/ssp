import chalk from 'chalk'
import { extractPacketData } from '.'

jest.mock('chalk', () => ({
  red: jest.fn(text => text),
}))

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
    expect(chalk.red).not.toHaveBeenCalled()
  })

  test('extracts and decrypts data from an encrypted packet buffer', () => {
    const buffer = Buffer.from([
      0x7f, 0x00, 0x11, 0x7e, 0x70, 0x2f, 0xfe, 0x1d, 0x41, 0x19, 0x44, 0xad, 0xda, 0xd1, 0xdf, 0xd6, 0x77, 0xf5, 0x33, 0xcc, 0x63, 0x1d,
    ])
    const expectedData = Buffer.from([0xf0, 0x00, 0x4a, 0x78, 0xb4])

    const result = extractPacketData(buffer, encryptKey, count)

    expect(result).toEqual(expectedData)
    expect(chalk.red).toHaveBeenCalled()
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
