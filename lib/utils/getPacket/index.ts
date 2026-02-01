import crypto from 'node:crypto'
import { CRC16 } from '../CRC16'
import { encrypt } from '../encrypt'
import { stuffBuffer } from '../stuffBuffer'

const STX = 0x7f
const STEX = 0x7e

interface CommandEntry {
  code: number
  encrypted: boolean
  args: false | Record<string, string>
  device?: string[]
  description?: string
  example?: string
}

import commandList from '../../static/commands.json'

export function getPacket(command: string, argBytes: Buffer, sequence: number, encryptKey: Buffer | null = null, eCount: number = 0): Buffer {
  const cmd = (commandList as Record<string, CommandEntry>)[command]
  if (cmd.args && argBytes.length === 0) {
    throw new Error('Command requires arguments')
  }

  const SEQ_SLAVE_ID = sequence
  let DATA: number[] = [cmd.code, ...argBytes]

  if (encryptKey !== null) {
    const eCOUNT = Buffer.alloc(4)
    eCOUNT.writeUInt32LE(eCount, 0)

    const ePACKING = crypto.randomBytes((16 - ((DATA.length + 7) % 16)) % 16)

    const crcPacket = [DATA.length, ...eCOUNT, ...DATA, ...ePACKING]
    const ENCRYPTED_DATA = encrypt(encryptKey, Buffer.from([...crcPacket, ...CRC16(crcPacket)]))

    DATA = [STEX, ...ENCRYPTED_DATA]
  }

  const crcPacket = [SEQ_SLAVE_ID, DATA.length, ...DATA]
  const PACKET = [...crcPacket, ...CRC16(crcPacket)]

  const STUFFED_PACKET = Buffer.concat([Buffer.from([STX]), stuffBuffer(Buffer.from(PACKET))])

  return STUFFED_PACKET
}
