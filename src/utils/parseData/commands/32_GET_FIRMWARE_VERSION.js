function parseGetFirmwareVersion(data, result) {
  result.info.version = Buffer.from(data).toString()
}

module.exports = parseGetFirmwareVersion
