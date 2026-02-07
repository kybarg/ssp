function parseGetDenominationRoute(data, result) {
  const res = {
    0: { code: 0, value: 'Recycled and used for payouts' },
    1: { code: 1, value: 'Detected denomination is routed to system cashbox' },
  }
  result.info = res[data[0]]
}

module.exports = parseGetDenominationRoute
