export function uInt64LE(number: bigint | number): Buffer {
  if (!Number.isInteger(Number(number)) || number < 0 || number > 18446744073709551615n) {
    throw new Error('Input must be an unsigned 64-bit integer')
  }

  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64LE(BigInt(number))
  return buffer
}
