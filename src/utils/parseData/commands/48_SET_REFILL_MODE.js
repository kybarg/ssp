function parseSetRefillMode(data, result) {
  if (data.length === 1) {
    result.info = {
      enabled: data[0] === 0x01,
    }
  }
}

module.exports = parseSetRefillMode
