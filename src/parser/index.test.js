const { SSPParser } = require('./index')

describe('SSPParser', () => {
  let parser
  let spy

  beforeEach(() => {
    parser = new SSPParser()
    spy = jest.fn()
    parser.on('data', spy)
  })

  afterEach(() => {
    parser.end()
  })

  test('should parse a packet', () => {
    parser.write(Buffer.from([127, 0, 1, 240, 32, 10]))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 1, 240, 32, 10]))
  })

  test('should parse a packet with a stuffed byte', () => {
    parser.write(Buffer.from([127, 0, 1, 127, 127, 32, 10]))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 1, 127, 32, 10]))
  })

  test('should reset if packet starts with a stuffed byte', () => {
    const resetSpy = jest.spyOn(parser, 'reset')
    parser.write(Buffer.from([127, 127, 32, 10]))
    expect(spy).not.toHaveBeenCalled()
    expect(resetSpy).toHaveBeenCalled()
  })

  test('should parse a packet with a stuffed byte at the end', () => {
    parser.write(Buffer.from([127, 0, 1, 240, 32, 127, 127]))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 1, 240, 32, 127]))
  })

  test('should restart a packet if last byte was start byte, and next is not', () => {
    parser.write(Buffer.from([127, 0, 1, 240, 32, 127, 0, 1, 240, 32, 10]))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 1, 240, 32, 10]))
  })

  test('should parse a packet with a stuffed byte at the end and a new packet', () => {
    parser.write(Buffer.from([127, 0, 1, 240, 32, 127, 127, 127, 0, 1, 240, 32, 10]))
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 1, 240, 32, 127]))
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 1, 240, 32, 10]))
  })

  test('should parse a packet with a stuffed byte at the end and a new packet with a stuffed byte', () => {
    parser.write(Buffer.from([127, 0, 1, 240, 32, 127, 127, 127, 0, 2, 127, 127, 240, 32, 10]))
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 1, 240, 32, 127]))
    expect(spy).toHaveBeenCalledWith(Buffer.from([127, 0, 2, 127, 240, 32, 10]))
  })

  test('_flush method should push buffer and reset', () => {
    const buffer = Buffer.from([127, 0, 1, 127, 127, 32, 10])
    parser.buffer = buffer

    const pushSpy = jest.spyOn(parser, 'push')
    const resetSpy = jest.spyOn(parser, 'reset')

    parser.end()
    expect(pushSpy).toHaveBeenCalledWith(buffer)
    expect(resetSpy).toHaveBeenCalled()
  })
})
