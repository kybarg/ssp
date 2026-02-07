/**
 * Reads bytes from a Buffer starting from the specified index with the given length.
 *
 * @param {Buffer} buffer - The Buffer from which to read bytes.
 * @param {number} startIndex - The starting index from which to begin reading.
 * @param {number} length - The number of bytes to read.
 * @returns {Buffer} - A new Buffer containing the extracted bytes.
 * @throws {Error} - Throws an error if the input is not a Buffer, if the start index is invalid,
 *                   or if the length exceeds the buffer size.
 */
function readBytesFromBuffer(buffer, startIndex, length) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer object')
  }

  // Ensure the provided index is within the buffer's bounds
  if (startIndex < 0 || startIndex >= buffer.length) {
    throw new Error('Invalid start index')
  }

  // Ensure the requested length doesn't exceed the buffer's remaining size
  if (length < 0 || startIndex + length > buffer.length) {
    throw new Error('Invalid length or exceeds buffer size')
  }

  // Use subarray to extract the specified range of bytes
  return buffer.subarray(startIndex, startIndex + length)
}

module.exports = readBytesFromBuffer
