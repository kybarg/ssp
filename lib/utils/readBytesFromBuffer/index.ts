export function readBytesFromBuffer(buffer: Buffer, startIndex: number, length: number): Buffer {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer object')
  }

  if (startIndex < 0 || startIndex >= buffer.length) {
    throw new Error('Invalid start index')
  }

  if (length < 0 || startIndex + length > buffer.length) {
    throw new Error('Invalid length or exceeds buffer size')
  }

  return buffer.subarray(startIndex, startIndex + length)
}
