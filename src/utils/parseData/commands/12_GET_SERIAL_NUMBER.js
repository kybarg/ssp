function parseGetSerialNumber(data, result) {
  result.info.serial_number = Buffer.from(data.slice(0, 4)).readUInt32BE()
}

module.exports = parseGetSerialNumber
