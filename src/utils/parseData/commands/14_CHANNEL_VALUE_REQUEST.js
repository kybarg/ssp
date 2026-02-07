const readBytesFromBuffer = require('../../readBytesFromBuffer')

function parseChannelValueRequest(data, result, protocolVersion) {
  const count = data[0]

  if (protocolVersion >= 6) {
    Object.assign(result.info, {
      channel: Array.from(data.subarray(1, count + 1)),
      country_code: Array.from({ length: count }, (_, i) => readBytesFromBuffer(data, count + 1 + i * 3, 3).toString()),
      value: Array.from({ length: count }, (_, i) => data.readUIntLE(count + 1 + count * 3 + i * 4, 4)),
    })
  } else {
    result.info.channel = Array.from(data.subarray(1, count + 1))
  }
}

module.exports = parseChannelValueRequest
