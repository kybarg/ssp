function parseGetCounters(data, result) {
  result.info.stacked = Buffer.from(data.slice(1, 5)).readUInt32LE()
  result.info.stored = Buffer.from(data.slice(5, 9)).readUInt32LE()
  result.info.dispensed = Buffer.from(data.slice(9, 13)).readUInt32LE()
  result.info.transferred_from_store_to_stacker = Buffer.from(data.slice(13, 17)).readUInt32LE()
  result.info.rejected = Buffer.from(data.slice(17, 21)).readUInt32LE()
}

module.exports = parseGetCounters
