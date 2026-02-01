import chalk from 'chalk'
import debug from 'debug'
import { CRC16 } from '../CRC16'
import { decrypt } from '../decrypt'

const log = debug('ssp')

const STX = 0x7f
const STEX = 0x7e

export function extractPacketData(buffer: Buffer, encryptKey: Buffer | null, count: number): Buffer {
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

  let extractedData: Buffer = packetData

  if (encryptKey !== null && packetData[0] === STEX) {
    const decryptedData = decrypt(encryptKey, Buffer.from(packetData.subarray(1)))

    log('Decrypted:', chalk.red(Buffer.from(decryptedData).toString('hex')))

    const eLength = decryptedData[0]
    const eCount = Buffer.from(decryptedData.subarray(1, 5)).readUInt32LE()
    extractedData = decryptedData.subarray(5, eLength + 5)

    if (eCount !== count + 1) {
      throw new Error('Encrypted counter mismatch')
    }
  }

  return extractedData
}
