function parseGetHopperOptions(data, result) {
  const value = data.readUInt16LE(0)

  Object.assign(result.info, {
    payMode: (value & 0x01) !== 0,
    levelCheck: (value & 0x02) !== 0,
    motorSpeed: (value & 0x04) !== 0,
    cashBoxPayAcive: (value & 0x08) !== 0,
  })
}

module.exports = parseGetHopperOptions
