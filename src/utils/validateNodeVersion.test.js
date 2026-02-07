const semver = require('semver')
const validateNodeVersion = require('./validateNodeVersion')
const { engines } = require('../../package.json')

describe('validateNodeVersion', () => {
  let originalEnginesNode

  beforeEach(() => {
    originalEnginesNode = engines.node
  })

  afterEach(() => {
    engines.node = originalEnginesNode
  })

  test('should not throw error when Node.js version satisfies the required version', () => {
    engines.node = process.version.replace('v', '>=')

    // Mocking the semver.satisfies function
    const mockSatisfies = jest.spyOn(semver, 'satisfies').mockReturnValue(true)

    expect(() => {
      validateNodeVersion()
    }).not.toThrow()

    // Restore the original function
    mockSatisfies.mockRestore()
  })

  test('should throw error when Node.js version does not satisfy the required version', () => {
    engines.node = process.version.replace('v', '<')

    // Mocking the semver.satisfies function
    const mockSatisfies = jest.spyOn(semver, 'satisfies').mockReturnValue(false)

    expect(() => {
      validateNodeVersion()
    }).toThrow()

    // Restore the original function
    mockSatisfies.mockRestore()
  })
})
