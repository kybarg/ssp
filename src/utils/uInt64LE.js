/**
 * Creates a Buffer representing the given unsigned 64-bit integer in little-endian format.
 *
 * @param {bigint} number - The unsigned 64-bit integer.
 * @throws {Error} - If the input is not an unsigned 64-bit integer or is out of range.
 * @returns {Buffer} - Buffer representing the unsigned 64-bit integer in little-endian format.
 */
function uInt64LE(number) {
  if (!Number.isInteger(Number(number)) || number < 0 || number > 18446744073709551615n) {
    throw new Error('Input must be an unsigned 64-bit integer')
  }

  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64LE(BigInt(number))
  return buffer
}

module.exports = uInt64LE
