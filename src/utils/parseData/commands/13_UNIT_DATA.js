const unitType = require('../../../static/unit_type.json')
const readBytesFromBuffer = require('../../readBytesFromBuffer')

function parseUnitData(data, result) {
  Object.assign(result.info, {
    unit_type: unitType[data[0]],
    firmware_version: (parseInt(readBytesFromBuffer(data, 1, 4).toString()) / 100).toFixed(2),
    country_code: readBytesFromBuffer(data, 5, 3).toString(),
    value_multiplier: data.readUIntBE(8, 3),
    protocol_version: data.readUInt8(11),
  })
}

module.exports = parseUnitData
