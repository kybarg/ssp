export function uInt16LE(number: number): Buffer {
  if (!Number.isInteger(number) || number < 0 || number > 65535) {
    throw new Error('Input must be an unsigned 16-bit integer')
  }

  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(number)
  return buffer
}
