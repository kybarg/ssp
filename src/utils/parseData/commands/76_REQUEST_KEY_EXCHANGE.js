function parseRequestKeyExchange(data, result) {
  result.info.key = Array.from(data)
}

module.exports = parseRequestKeyExchange
