const uInt64LE = require('./uInt64LE')

/**
 * Creates a Secure Session Protocol (SSP) host encryption key.
 * @param {Buffer} buffer - The buffer containing slave inter key.
 * @param {object} keys - An object containing fixedKey, hostRandom, and modulus.
 * @param {string} keys.fixedKey - The fixed key in hexadecimal format.
 * @param {bigint} keys.hostRandom - The host random value.
 * @param {bigint} keys.modulus - The modulus value.
 * @returns {object} An object containing slaveInterKey, key, and encryptKey.
 */
function createSSPHostEncryptionKey(buffer, keys) {
  const { fixedKey, hostRandom, modulus } = keys
  const slaveInterKey = Buffer.from(buffer).readBigInt64LE()
  const key = slaveInterKey ** hostRandom % modulus
  const encryptKey = Buffer.concat([Buffer.from(fixedKey, 'hex').swap64(), uInt64LE(key)])

  return {
    slaveInterKey,
    key,
    encryptKey,
  }
}

module.exports = createSSPHostEncryptionKey
