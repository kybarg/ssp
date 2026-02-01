import { absBigInt } from '.'

describe('absBigInt', () => {
  test('should return 1 for -1', () => {
    const num = BigInt(-1)
    expect(absBigInt(num)).toBe(BigInt(1))
  })

  test('should return 1 for 1', () => {
    const num = BigInt(1)
    expect(absBigInt(num)).toBe(BigInt(1))
  })
})
