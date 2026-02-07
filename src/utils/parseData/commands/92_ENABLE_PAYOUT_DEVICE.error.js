function parseEnablePayoutDeviceError(data, result) {
  result.info.errorCode = data[1]
  switch (data[1]) {
    case 1:
      result.info.error = 'No device connected'
      break
    case 2:
      result.info.error = 'Invalid currency detected'
      break
    case 3:
      result.info.error = 'Device busy'
      break
    case 4:
      result.info.error = 'Empty only (Note float only)'
      break
    case 5:
      result.info.error = 'Device error'
      break
    default:
      result.info.error = 'Unknown error'
      break
  }
}

module.exports = parseEnablePayoutDeviceError
