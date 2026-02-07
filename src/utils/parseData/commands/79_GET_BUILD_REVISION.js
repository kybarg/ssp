const unitType = require('../../../static/unit_type.json')

function parseGetBuildRevision(data, result) {
  const count = data.length / 3
  result.info.device = {}
  for (let i = 0; i < count; i++) {
    result.info.device[i] = {
      unitType: unitType[data[i * 3]],
      revision: Buffer.from(data.slice(i * 3 + 1, i * 3 + 3)).readUInt16LE(),
    }
  }
}

module.exports = parseGetBuildRevision
