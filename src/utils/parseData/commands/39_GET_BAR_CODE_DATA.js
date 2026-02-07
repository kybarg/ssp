function parseGetBarCodeData(data, result) {
  const status = { 0: 'no_valid_data', 1: 'ticket_in_escrow', 2: 'ticket_stacked', 3: 'ticket_rejected' }
  result.info.status = status[data[0]]
  result.info.data = Buffer.from(data.slice(2, data[1] + 2)).toString()
}

module.exports = parseGetBarCodeData
