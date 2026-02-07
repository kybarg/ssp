const { satisfies } = require('semver')
const { engines } = require('../../package.json')

/**
 * Validates if the current Node.js version satisfies the required version.
 * @throws {Error} Throws an error if the current Node.js version does not satisfy the required version.
 */
function validateNodeVersion() {
  if (!satisfies(process.version, engines.node)) {
    throw new Error(`Node.js version must be ${engines.node}`)
  }
}

module.exports = validateNodeVersion
