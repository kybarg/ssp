/**
 * Stuff bytes in a buffer: if a byte of value 0x7f is found, adds another byte with the value 0x7f after it.
 * @param {Buffer} inputBuffer - The input buffer to stuff.
 * @returns {Buffer} - The stuffed buffer.
 */
function stuffBuffer(inputBuffer) {
  const outputBuffer = Buffer.allocUnsafe(inputBuffer.length * 2) // Allocate buffer with double the size
  let j = 0

  for (let i = 0; i < inputBuffer.length; i++) {
    const byte = inputBuffer[i]
    outputBuffer[j++] = byte // Copy the original byte to the output buffer

    // If the byte has a value of 0x7f, add another byte with the value 0x7f after it
    if (byte === 0x7f) {
      outputBuffer[j++] = 0x7f
    }
  }

  return outputBuffer.subarray(0, j) // Truncate the buffer to the actual size
}

module.exports = stuffBuffer
