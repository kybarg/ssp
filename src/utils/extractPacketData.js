const chalk = require('chalk')
const debug = require('debug')('ssp')
const CRC16 = require('./CRC16')
const decrypt = require('./decrypt')

const STX = 0x7f
const STEX = 0x7e

/**
 * Extracts data from a packet buffer.
 *
 * @param {Buffer} buffer - The packet buffer to extract data from.
 * @param {Buffer|null} encryptKey - The encryption key.
 * @param {number} count - Current count value.
 * @returns {Buffer} - Extracted data.
 * @throws {Error} - Throws an error if the packet format is invalid, CRC check fails, or decryption encounters an error.
 */
function extractPacketData(buffer, encryptKey, count) {
  if (buffer[0] !== STX) {
    throw new Error('Unknown response')
  }

  buffer = buffer.subarray(1)
  const dataLength = buffer[1]
  const packetData = buffer.subarray(2, dataLength + 2)
  const crcData = buffer.subarray(0, dataLength + 2)
  const CRC = CRC16(crcData)

  const crcCheck = buffer.subarray(-2)
  if (!CRC.equals(crcCheck)) {
    throw new Error('Wrong CRC16')
  }

  let extractedData = packetData

  if (encryptKey !== null && packetData[0] === STEX) {
    const decryptedData = decrypt(encryptKey, Buffer.from(packetData.subarray(1)))

    debug('Decrypted:', chalk.red(Buffer.from(decryptedData).toString('hex')))

    const eLength = decryptedData[0]
    const eCount = Buffer.from(decryptedData.subarray(1, 5)).readUInt32LE()
    extractedData = decryptedData.subarray(5, eLength + 5)

    if (eCount !== count + 1) {
      throw new Error('Encrypted counter mismatch')
    }
  }

  return extractedData
}

module.exports = extractPacketData
