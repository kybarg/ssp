const unitType = require('../../../static/unit_type.json')
const readBytesFromBuffer = require('../../readBytesFromBuffer')

function parseSetupRequest(data, result) {
  const unit_type = unitType[data[0]]
  const firmware_version = (parseInt(readBytesFromBuffer(data, 1, 4).toString()) / 100).toFixed(2)
  const country_code = readBytesFromBuffer(data, 5, 3).toString()
  const isSmartHopper = data[0] === 3

  if (isSmartHopper) {
    const protocol_version = data.readUInt8(8)
    const number_of_coin_values = data.readUInt8(9)
    const coin_values = Array.from({ length: number_of_coin_values }, (_, i) => data.readUIntLE(10 + i * 2, 2))

    Object.assign(result.info, {
      unit_type,
      firmware_version,
      country_code,
      protocol_version,
      number_of_coin_values,
      coin_values,
    })

    if (protocol_version >= 6) {
      const country_codes_for_values = Array.from({ length: number_of_coin_values }, (_, i) =>
        readBytesFromBuffer(data, 10 + number_of_coin_values * 2 + i * 3, 3).toString(),
      )
      Object.assign(result.info, { country_codes_for_values })
    }
  } else {
    const n = data.readUInt8(11)
    const value_multiplier = data.readUIntBE(8, 3)

    Object.assign(result.info, {
      channel_security: Array.from(data.slice(12 + n, 12 + n * 2)),
      channel_value: Array.from(readBytesFromBuffer(data, 12, n).map(value => value * value_multiplier)),
      country_code,
      firmware_version,
      number_of_channels: n,
      protocol_version: data.readUInt8(15 + n * 2),
      real_value_multiplier: data.readUIntBE(12 + n * 2, 3),
      unit_type,
      value_multiplier,
    })

    if (result.info.protocol_version >= 6) {
      Object.assign(result.info, {
        expanded_channel_country_code: readBytesFromBuffer(data, 16 + n * 2, n * 3)
          .toString()
          .match(/.{3}/g),
        expanded_channel_value: Array.from({ length: n }, (_, i) => readBytesFromBuffer(data, 16 + n * 5, n * 4).readUInt32LE(i * 4)),
      })
    }
  }
}

module.exports = parseSetupRequest
