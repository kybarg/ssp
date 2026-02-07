/**
 * Creates a Buffer representing the given unsigned 32-bit integer in little-endian format.
 *
 * @param {number} number - The unsigned 32-bit integer.
 * @throws {Error} - If the input is not an unsigned 32-bit integer or is out of range.
 * @returns {Buffer} - Buffer representing the unsigned 32-bit integer in little-endian format.
 */
function uInt32LE(number) {
  if (!Number.isInteger(number) || number < 0 || number > 4294967295) {
    throw new Error('Input must be an unsigned 32-bit integer')
  }

  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(number)
  return buffer
}

module.exports = uInt32LE
