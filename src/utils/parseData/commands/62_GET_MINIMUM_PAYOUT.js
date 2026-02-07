function parseGetMinimumPayout(data, result) {
  result.info.value = Buffer.from(data).readUInt32LE()
}

module.exports = parseGetMinimumPayout
