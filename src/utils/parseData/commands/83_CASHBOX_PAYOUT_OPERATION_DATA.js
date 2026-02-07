function parseCashboxPayoutOperationData(data, result) {
  result.info = { data: [] }
  for (let i = 0; i < data[0]; i++) {
    result.info.data[i] = {
      quantity: Buffer.from(data.slice(i * 9 + 1, i * 9 + 3)).readUInt16LE(),
      value: Buffer.from(data.slice(i * 9 + 3, i * 9 + 7)).readUInt32LE(),
      country_code: Buffer.from(data.slice(i * 9 + 7, i * 9 + 10)).toString(),
    }
  }
}

module.exports = parseCashboxPayoutOperationData
