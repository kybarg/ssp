function parseSetValueReportingTypeError(data, result) {
  result.info.errorCode = data[1]
  switch (data[1]) {
    case 1:
      result.info.error = 'No payout connected'
      break
    case 2:
      result.info.error = 'Invalid currency detected'
      break
    case 3:
      result.info.error = 'Payout device error'
      break
    default:
      result.info.error = 'Unknown error'
      break
  }
}

module.exports = parseSetValueReportingTypeError
