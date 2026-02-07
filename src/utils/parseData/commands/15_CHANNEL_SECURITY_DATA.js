function parseChannelSecurityData(data, result) {
  const level = {
    0: 'not_implemented',
    1: 'low',
    2: 'std',
    3: 'high',
    4: 'inhibited',
  }
  result.info.channel = {}
  for (let i = 1; i <= data[0]; i++) {
    result.info.channel[i] = level[data[i]]
  }
}

module.exports = parseChannelSecurityData
