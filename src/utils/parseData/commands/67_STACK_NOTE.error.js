function parseStackNoteError(data, result) {
  result.info.errorCode = data[1]
  switch (data[1]) {
    case 1:
      result.info.error = 'Note float unit not connected'
      break
    case 2:
      result.info.error = 'Note float empty'
      break
    case 3:
      result.info.error = 'Note float busy'
      break
    case 4:
      result.info.error = 'Note float disabled'
      break
    default:
      result.info.error = 'Unknown error'
      break
  }
}

module.exports = parseStackNoteError
