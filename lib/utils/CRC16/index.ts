export function CRC16(source: number[] | Buffer): Buffer {
  const CRC_SSP_SEED = 0xffff
  const CRC_SSP_POLY = 0x8005
  let crc = CRC_SSP_SEED

  for (let i = 0; i < source.length; ++i) {
    crc ^= source[i] << 8
    for (let j = 0; j < 8; ++j) {
      crc = crc & 0x8000 ? (crc << 1) ^ CRC_SSP_POLY : crc << 1
    }
  }

  crc &= 0xffff

  const crcBuffer = Buffer.alloc(2)
  crcBuffer.writeUInt16LE(crc, 0)
  return crcBuffer
}
