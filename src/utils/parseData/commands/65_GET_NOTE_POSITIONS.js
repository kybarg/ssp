function parseGetNotePositions(data, result) {
  const count = data[0]
  data = data.slice(1)
  result.info.slot = {}

  if (data.length === count) {
    for (let i = 0; i < count; i++) {
      result.info.slot[i + 1] = { channel: data[i] }
    }
  } else {
    for (let i = 0; i < count; i++) {
      result.info.slot[i + 1] = { value: data.readUInt32LE(i * 4) }
    }
  }
}

module.exports = parseGetNotePositions
