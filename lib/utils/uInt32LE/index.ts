export function uInt32LE(number: number): Buffer {
  if (!Number.isInteger(number) || number < 0 || number > 4294967295) {
    throw new Error('Input must be an unsigned 32-bit integer')
  }

  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(number)
  return buffer
}
