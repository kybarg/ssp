import { validateNodeVersion } from '.'
import { engines } from '../../../package.json'

describe('validateNodeVersion', () => {
  let originalEnginesNode: string

  beforeEach(() => {
    originalEnginesNode = engines.node
  })

  afterEach(() => {
    engines.node = originalEnginesNode
  })

  test('should not throw error when Node.js version satisfies the required version', () => {
    engines.node = process.version.replace('v', '>=')

    expect(() => {
      validateNodeVersion()
    }).not.toThrow()
  })

  test('should throw error when Node.js version does not satisfy the required version', () => {
    engines.node = process.version.replace('v', '<')

    expect(() => {
      validateNodeVersion()
    }).toThrow()
  })
})
