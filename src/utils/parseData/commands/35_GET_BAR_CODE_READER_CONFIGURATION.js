function parseGetBarCodeReaderConfiguration(data, result) {
  const status = {
    0: { 0: 'none', 1: 'Top reader fitted', 2: 'Bottom reader fitted', 3: 'both fitted' },
    1: { 0: 'none', 1: 'top', 2: 'bottom', 3: 'both' },
    2: { 1: 'Interleaved 2 of 5' },
  }
  result.info = {
    bar_code_hardware_status: status[0][data[0]],
    readers_enabled: status[1][data[1]],
    bar_code_format: status[2][data[2]],
    number_of_characters: data[3],
  }
}

module.exports = parseGetBarCodeReaderConfiguration
