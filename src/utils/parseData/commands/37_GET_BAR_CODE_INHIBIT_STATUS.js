function parseGetBarCodeInhibitStatus(data, result) {
  result.info.currency_read_enable = data[0].toString(2).slice(7, 8) === '0'
  result.info.bar_code_enable = data[0].toString(2).slice(6, 7) === '0'
}

module.exports = parseGetBarCodeInhibitStatus
