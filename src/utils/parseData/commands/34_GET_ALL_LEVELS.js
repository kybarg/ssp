function parseGetAllLevels(data, result) {
  result.info.counter = {}
  for (let i = 0; i < data[0]; i++) {
    const tmp = data.slice(i * 9 + 1, i * 9 + 10)
    result.info.counter[i + 1] = {
      denomination_level: Buffer.from(tmp.slice(0, 2)).readUInt16LE(),
      value: Buffer.from(tmp.slice(2, 6)).readUInt32LE(),
      country_code: Buffer.from(tmp.slice(6, 9)).toString(),
    }
  }
}

module.exports = parseGetAllLevels
