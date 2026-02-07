function parseGetNotePositionsError(data, result) {
  result.info.errorCode = data[1]
  if (data[1] === 2) {
    result.info.error = 'Invalid currency'
  }
}

module.exports = parseGetNotePositionsError
