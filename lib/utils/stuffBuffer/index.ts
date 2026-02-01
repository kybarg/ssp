export function stuffBuffer(inputBuffer: Buffer): Buffer {
  const outputBuffer = Buffer.allocUnsafe(inputBuffer.length * 2)
  let j = 0

  for (let i = 0; i < inputBuffer.length; i++) {
    const byte = inputBuffer[i]
    outputBuffer[j++] = byte

    if (byte === 0x7f) {
      outputBuffer[j++] = 0x7f
    }
  }

  return outputBuffer.subarray(0, j)
}
