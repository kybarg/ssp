function parseGetDenominationLevel(data, result) {
  result.info.level = Buffer.from(data).readUInt16LE()
}

module.exports = parseGetDenominationLevel
