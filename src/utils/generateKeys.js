const crypto = require('node:crypto')

/**
 * Generates cryptographic keys for a secure communication protocol.
 * @returns {Object} An object containing the generated keys:
 *   - generator: The generator value for the keys.
 *   - modulus: The modulus value for the keys.
 *   - hostRandom: A random value generated for the host.
 *   - hostInter: Intermediate value computed for the host.
 * @throws {Error} Throws an error if either generator or modulus is zero.
 */
function generateKeys() {
  // Generate a prime number for the generator and modulus with specified bit length.
  let generator = crypto.generatePrimeSync(16, { bigint: true, safe: true })
  let modulus = crypto.generatePrimeSync(16, { bigint: true, safe: true })

  // Check if either generator or modulus is zero, and throw an error if so.
  if (generator === 0n || modulus === 0n) {
    throw new Error('GENERATOR and MODULUS should be > 0')
  }

  // If generator is less than modulus, swap their values.
  if (generator < modulus) {
    ;[modulus, generator] = [generator, modulus]
  }

  // Generate a random number for the host and calculate hostInter using modular exponentiation.
  let hostRandom = BigInt(crypto.randomBytes(2).readUInt16LE()) % 2147483648n
  let hostInter = generator ** hostRandom % modulus

  // Return the generated keys as an object.
  return {
    generator,
    modulus,
    hostRandom,
    hostInter,
  }
}

module.exports = generateKeys
