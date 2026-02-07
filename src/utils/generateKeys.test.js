const crypto = require('node:crypto')
const generateKeys = require('./generateKeys')

describe('generateKeys function', () => {
  let originalGeneratePrimeSync
  let originalRandomBytes

  beforeEach(() => {
    originalGeneratePrimeSync = crypto.generatePrimeSync
    originalRandomBytes = crypto.randomBytes
  })

  afterEach(() => {
    crypto.generatePrimeSync = originalGeneratePrimeSync
    crypto.randomBytes = originalRandomBytes
  })

  test('should return an object with the expected properties', () => {
    const keys = generateKeys()
    expect(keys).toEqual(
      expect.objectContaining({
        generator: expect.any(BigInt),
        modulus: expect.any(BigInt),
        hostRandom: expect.any(BigInt),
        hostInter: expect.any(BigInt),
      }),
    )
  })

  test('should swap generator and modulus in case generator < modulus', () => {
    crypto.generatePrimeSync = jest.fn().mockReturnValueOnce(7n).mockReturnValueOnce(13n)

    const keys = generateKeys()
    expect(keys.generator).toEqual(13n)
    expect(keys.modulus).toEqual(7n)
  })

  test('should throw an error if either generator or modulus is zero', () => {
    crypto.generatePrimeSync = jest.fn().mockReturnValueOnce(0n)

    expect(generateKeys).toThrow('GENERATOR and MODULUS should be > 0')
  })

  test('should correctly calculate the hostInter value', () => {
    crypto.randomBytes = jest.fn().mockReturnValueOnce(Buffer.from([1, 2]))
    crypto.generatePrimeSync = jest.fn().mockReturnValueOnce(13n).mockReturnValueOnce(7n)

    // Calculating the expected hostInter value manually
    const hostRandom = 513n
    const generator = 13n
    const modulus = 7n
    const expectedHostInter = generator ** hostRandom % modulus

    const keys = generateKeys()
    expect(keys.hostInter).toEqual(expectedHostInter)
  })
})
