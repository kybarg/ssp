/**
 * Creates a Buffer representing the given unsigned 16-bit integer in little-endian format.
 *
 * @param {number} number - The unsigned 16-bit integer.
 * @throws {Error} - If the input is not an unsigned 16-bit integer or is out of range.
 * @returns {Buffer} - Buffer representing the unsigned 16-bit integer in little-endian format.
 */
function uInt16LE(number) {
  if (!Number.isInteger(number) || number < 0 || number > 65535) {
    throw new Error('Input must be an unsigned 16-bit integer')
  }

  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(number)
  return buffer
}

module.exports = uInt16LE
