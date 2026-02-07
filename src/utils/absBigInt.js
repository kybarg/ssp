/**
 * Returns the absolute value of a BigInt.
 *
 * @param {BigInt} n - The BigInt for which to calculate the absolute value.
 * @returns {BigInt} - The absolute value of the input BigInt.
 */
function absBigInt(n) {
  return n < 0n ? -n : n
}

module.exports = absBigInt
