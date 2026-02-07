function parsePayoutAmountError(data, result) {
  result.info.errorCode = data[1]
  switch (data[1]) {
    case 0:
      result.info.error = 'Not enough value in device'
      break
    case 1:
      result.info.error = 'Cannot pay exact amount'
      break
    case 3:
      result.info.error = 'Device busy'
      break
    case 4:
      result.info.error = 'Device disabled'
      break
    default:
      result.info.error = 'Unknown error'
      break
  }
}

module.exports = parsePayoutAmountError
