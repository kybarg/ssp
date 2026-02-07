const rejectNote = require('../../../static/reject_note.json')

function parseLastRejectCode(data, result) {
  result.info.code = data[0]
  result.info.name = rejectNote[data[0]].name
  result.info.description = rejectNote[data[0]].description
}

module.exports = parseLastRejectCode
