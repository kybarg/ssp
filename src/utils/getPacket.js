const crypto = require('node:crypto')
const encrypt = require('./encrypt')
const CRC16 = require('./CRC16')
const stuffBuffer = require('./stuffBuffer')
const commandList = require('../static/commands.json')

const STX = 0x7f
const STEX = 0x7e

/**
 * Constructs a packet based on the provided parameters.
 * @param {string} command - The command name.
 * @param {Buffer} argBytes - The buffer containing arguments.
 * @param {number} sequence - The sequence number.
 * @param {Buffer|null} encryptKey - The encryption key. Defaults to null if not provided.
 * @param {number} eCount - The encryption count.
 * @returns {Buffer} - The constructed packet.
 */
function getPacket(command, argBytes, sequence, encryptKey = null, eCount) {
  if (commandList[command].args && argBytes.length === 0) {
    throw new Error('Command requires arguments')
  }

  const SEQ_SLAVE_ID = sequence
  let DATA = [commandList[command].code, ...argBytes]

  // Encrypted packet
  if (encryptKey !== null) {
    const eCOUNT = Buffer.alloc(4)
    eCOUNT.writeUInt32LE(eCount, 0)

    /**
     * Random data to make the length of the length + count + data + packing + CRCL + CRCH to be a multiple of 16 bytes
     * 7 = DATA.length (1 byte) + eCOUNT (4 bytes) + eCRCL (1 byte) + eCRCH (1 byte)
     */
    const ePACKING = crypto.randomBytes((16 - ((DATA.length + 7) % 16)) % 16)

    // data to calculate CRC on
    const crcPacket = [DATA.length, ...eCOUNT, ...DATA, ...ePACKING]
    const ENCRYPTED_DATA = encrypt(encryptKey, Buffer.from([...crcPacket, ...CRC16(crcPacket)]))

    DATA = [STEX, ...ENCRYPTED_DATA]
  }

  // data to calculate CRC on
  const crcPacket = [SEQ_SLAVE_ID, DATA.length, ...DATA]
  const PACKET = [...crcPacket, ...CRC16(crcPacket)]

  const STUFFED_PACKET = Buffer.concat([Buffer.from([STX]), stuffBuffer(PACKET)])

  return STUFFED_PACKET
}

module.exports = getPacket
