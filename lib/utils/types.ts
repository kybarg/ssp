export interface SSPKeys {
  encryptKey: Buffer | null
  fixedKey: string
  generator: bigint | null
  hostInter: bigint | null
  hostRandom: bigint | null
  key: bigint | null
  modulus: bigint | null
  slaveInterKey: bigint | null
}

export interface GeneratedKeys {
  generator: bigint
  modulus: bigint
  hostRandom: bigint
  hostInter: bigint
}

export interface EncryptionKeyResult {
  slaveInterKey: bigint
  key: bigint
  encryptKey: Buffer
}

export interface ParsedResult {
  success: boolean
  status: string
  command: string
  info: Record<string, unknown>
}

export interface ExtractedPacketData {
  success: boolean
  data: Buffer
}
