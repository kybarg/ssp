const CRC16 = require('./CRC16')

describe('CRC16', () => {
  it('calculates CRC16 correctly for an empty string', () => {
    expect(CRC16([])).toEqual(Buffer.from([255, 255]))
  })

  it('calculates CRC16 correctly for a single character string', () => {
    expect(CRC16([65])).toEqual(Buffer.from([132, 252]))
  })

  it('calculates CRC16 correctly for a multiple character string', () => {
    expect(CRC16([65, 66, 67])).toEqual(Buffer.from([155, 6]))
  })

  it('calculates CRC16 correctly for a large string', () => {
    expect(CRC16([65, 65, 65, 65, 65, 65, 65, 65])).toEqual(Buffer.from([232, 166]))
  })

  it('calculates CRC16 correctly for a Buffer input', () => {
    const buffer = Buffer.from('ABCD', 'utf-8')
    expect(CRC16(buffer)).toEqual(Buffer.from([140, 154]))
  })
})
