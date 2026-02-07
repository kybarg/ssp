const crypto = require('node:crypto')

/**
 * Encrypts data using AES encryption with ECB mode.
 *
 * @param {Buffer} key - The key for encryption.
 * @param {Buffer} data - The data to be encrypted.
 * @returns {Buffer} - The encrypted data.
 * @throws {Error} - Throws an error if key or data is not provided.
 */
function encrypt(key, data) {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  // Create cipher using ECB mode (Electronic Codebook)
  const cipher = crypto.createCipheriv('aes-128-ecb', key, null)

  // Enable automatic padding
  cipher.setAutoPadding(false)

  // Encrypt the data
  const encryptedData = Buffer.concat([cipher.update(data), cipher.final()])

  return encryptedData
}

module.exports = encrypt
