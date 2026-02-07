const crypto = require('node:crypto')

/**
 * Decrypts data using AES decryption with ECB mode.
 *
 * @param {Buffer} key - The key for decryption.
 * @param {Buffer} data - The data to be decrypted.
 * @returns {Buffer} - The decrypted data.
 * @throws {Error} - Throws an error if key or data is not provided.
 */
function decrypt(key, data) {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  // Create decipher using ECB mode (Electronic Codebook)
  const decipher = crypto.createDecipheriv('aes-128-ecb', key, null)

  // Enable automatic padding
  decipher.setAutoPadding(false)

  // Decrypt the data
  const decryptedData = Buffer.concat([decipher.update(data), decipher.final()])

  return decryptedData
}

module.exports = decrypt
