import { EncryptionKeyResult, SSPKeys } from '../types'
import { uInt64LE } from '../uInt64LE'

export function createSSPHostEncryptionKey(buffer: Buffer, keys: Pick<SSPKeys, 'fixedKey' | 'hostRandom' | 'modulus'>): EncryptionKeyResult {
  const { fixedKey, hostRandom, modulus } = keys
  const slaveInterKey = Buffer.from(buffer).readBigInt64LE()
  const key = slaveInterKey ** hostRandom! % modulus!
  const encryptKey = Buffer.concat([Buffer.from(fixedKey, 'hex').swap64(), uInt64LE(key)])

  return {
    slaveInterKey,
    key,
    encryptKey,
  }
}
