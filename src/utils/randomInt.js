/**
 * Generate a random integer between min (inclusive) and max (exclusive).
 *
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (exclusive).
 * @returns {number} - A random integer between min and max.
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports = randomInt
