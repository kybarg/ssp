import { randomInt } from '.'

describe('randomInt', () => {
  test('should return random int', () => {
    const int = randomInt(10, 100)

    expect(typeof int).toBe('number')
    expect(int >= 10).toBeTruthy()
    expect(int <= 100).toBeTruthy()
  })
})
