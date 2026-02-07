const argsToByte = require('./argsToByte')

describe('argsToByte function', () => {
  test('SET_GENERATOR', () => {
    const result = argsToByte('SET_GENERATOR', { key: 982451653 }, 6)
    expect(result).toEqual(Buffer.from([0xc5, 0x05, 0x8f, 0x3a, 0x00, 0x00, 0x00, 0x00]))
  })

  test('SET_MODULUS', () => {
    const result = argsToByte('SET_MODULUS', { key: 1287821 }, 6)
    expect(result).toEqual(Buffer.from([0x8d, 0xa6, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00]))
  })

  test('REQUEST_KEY_EXCHANGE', () => {
    const result = argsToByte('REQUEST_KEY_EXCHANGE', { key: 7554354432121 }, 6)
    expect(result).toEqual(Buffer.from([0x79, 0xc8, 0x9c, 0xe2, 0xde, 0x06, 0x00, 0x00]))
  })

  test('SET_DENOMINATION_ROUTE: protocol < 6', () => {
    const result = argsToByte('SET_DENOMINATION_ROUTE', { route: 'cashbox', value: 10 }, 5)
    expect(result).toEqual(Buffer.from([0x01, 0x0a, 0x00, 0x00, 0x00]))
  })

  test('SET_DENOMINATION_ROUTE: protocol < 6, hopper', () => {
    const result = argsToByte('SET_DENOMINATION_ROUTE', { route: 'cashbox', value: 10, isHopper: true }, 5)
    expect(result).toEqual(Buffer.from([0x01, 0x0a, 0x00]))
  })

  test('SET_DENOMINATION_ROUTE: protocol >= 6', () => {
    const result = argsToByte('SET_DENOMINATION_ROUTE', { route: 'payout', value: 10, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('SET_CHANNEL_INHIBITS', () => {
    const result = argsToByte('SET_CHANNEL_INHIBITS', { channels: [1, 1, 1, 0, 0, 0] }, 6)
    expect(result).toEqual(Buffer.from([0x07, 0x00]))
  })

  test('SET_COIN_MECH_GLOBAL_INHIBIT: enable', () => {
    const result = argsToByte('SET_COIN_MECH_GLOBAL_INHIBIT', { enable: true }, 6)
    expect(result).toEqual(Buffer.from([0x01]))
  })

  test('SET_COIN_MECH_GLOBAL_INHIBIT: disable', () => {
    const result = argsToByte('SET_COIN_MECH_GLOBAL_INHIBIT', { enable: false }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('SET_HOPPER_OPTIONS: 1', () => {
    const result = argsToByte('SET_HOPPER_OPTIONS', { payMode: 0, levelCheck: false, motorSpeed: 1, cashBoxPayActive: false }, 6)
    expect(result).toEqual(Buffer.from([0x04, 0x00]))
  })

  test('SET_HOPPER_OPTIONS: 2', () => {
    const result = argsToByte('SET_HOPPER_OPTIONS', { payMode: 1, levelCheck: true, motorSpeed: 0, cashBoxPayActive: true }, 6)
    expect(result).toEqual(Buffer.from([0x0b, 0x00]))
  })

  test('GET_DENOMINATION_ROUTE: protocol < 6', () => {
    const result = argsToByte('GET_DENOMINATION_ROUTE', { value: 500 }, 5)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00]))
  })

  test('GET_DENOMINATION_ROUTE: hopper, protocol < 6', () => {
    const result = argsToByte('GET_DENOMINATION_ROUTE', { value: 500, isHopper: true }, 5)
    expect(result).toEqual(Buffer.from([0xf4, 0x01]))
  })

  test('GET_DENOMINATION_ROUTE: protocol >= 6', () => {
    const result = argsToByte('GET_DENOMINATION_ROUTE', { value: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('SET_DENOMINATION_LEVEL: protocol < 6', () => {
    const result = argsToByte('SET_DENOMINATION_LEVEL', { value: 20, denomination: 50 }, 5)
    expect(result).toEqual(Buffer.from([0x14, 0x00, 0x32, 0x00]))
  })

  test('SET_DENOMINATION_LEVEL: protocol >= 6', () => {
    const result = argsToByte('SET_DENOMINATION_LEVEL', { value: 12, denomination: 100, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x0c, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('SET_REFILL_MODE: on', () => {
    const result = argsToByte('SET_REFILL_MODE', { mode: 'on' }, 6)
    expect(result).toEqual(Buffer.from([0x05, 0x81, 0x10, 0x11, 0x01]))
  })

  test('SET_REFILL_MODE: off', () => {
    const result = argsToByte('SET_REFILL_MODE', { mode: 'off' }, 6)
    expect(result).toEqual(Buffer.from([0x05, 0x81, 0x10, 0x11, 0x00]))
  })

  test('SET_REFILL_MODE: get', () => {
    const result = argsToByte('SET_REFILL_MODE', { mode: 'get' }, 6)
    expect(result).toEqual(Buffer.from([0x05, 0x81, 0x10, 0x01]))
  })

  test('HOST_PROTOCOL_VERSION', () => {
    const result = argsToByte('HOST_PROTOCOL_VERSION', { version: 6 }, 6)
    expect(result).toEqual(Buffer.from([0x06]))
  })

  test('SET_BAR_CODE_CONFIGURATION', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', { enable: 'both', numChar: 18 }, 6)
    expect(result).toEqual(Buffer.from([0x03, 0x01, 0x12]))
  })

  test('SET_BAR_CODE_CONFIGURATION: bound low', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', { enable: 'top', numChar: 5 }, 6)
    expect(result).toEqual(Buffer.from([0x01, 0x01, 0x06]))
  })

  test('SET_BAR_CODE_CONFIGURATION: bound up', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', { enable: 'bottom', numChar: 30 }, 6)
    expect(result).toEqual(Buffer.from([0x02, 0x01, 0x18]))
  })

  test('SET_BAR_CODE_CONFIGURATION: none', () => {
    const result = argsToByte('SET_BAR_CODE_CONFIGURATION', {}, 6)
    expect(result).toEqual(Buffer.from([0x00, 0x01, 0x06]))
  })

  test('SET_BAR_CODE_INHIBIT_STATUS', () => {
    const result = argsToByte('SET_BAR_CODE_INHIBIT_STATUS', { currencyRead: true, barCode: true }, 6)
    expect(result).toEqual(Buffer.from([0xff]))
  })

  test('SET_BAR_CODE_INHIBIT_STATUS: turned off', () => {
    const result = argsToByte('SET_BAR_CODE_INHIBIT_STATUS', { currencyRead: false, barCode: false }, 6)
    expect(result).toEqual(Buffer.from([0xfc]))
  })

  test('PAYOUT_AMOUNT: protocol < 6', () => {
    const result = argsToByte('PAYOUT_AMOUNT', { amount: 500 }, 4)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00]))
  })

  test('PAYOUT_AMOUNT: protocol >= 6', () => {
    const result = argsToByte('PAYOUT_AMOUNT', { amount: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52, 0x58]))
  })

  test('PAYOUT_AMOUNT: protocol >= 6, test', () => {
    const result = argsToByte('PAYOUT_AMOUNT', { test: true, amount: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52, 0x19]))
  })

  test('GET_DENOMINATION_LEVEL: protocol < 6', () => {
    const result = argsToByte('GET_DENOMINATION_LEVEL', { amount: 10 }, 5)
    expect(result).toEqual(Buffer.from([0x0a, 0x00, 0x00, 0x00]))
  })

  test('GET_DENOMINATION_LEVEL: protocol >= 6', () => {
    const result = argsToByte('GET_DENOMINATION_LEVEL', { amount: 500, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0xf4, 0x01, 0x00, 0x00, 0x45, 0x55, 0x52]))
  })

  test('FLOAT_AMOUNT: protocol < 6', () => {
    const result = argsToByte('FLOAT_AMOUNT', { min_possible_payout: 50, amount: 10000 }, 5)
    expect(result).toEqual(Buffer.from([0x32, 0x00, 0x10, 0x27, 0x00, 0x00]))
  })

  test('FLOAT_AMOUNT: protocol >= 6', () => {
    const result = argsToByte('FLOAT_AMOUNT', { min_possible_payout: 50, amount: 10000, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x32, 0x00, 0x10, 0x27, 0x00, 0x00, 0x45, 0x55, 0x52, 0x58]))
  })

  test('FLOAT_AMOUNT: protocol >= 6, test', () => {
    const result = argsToByte('FLOAT_AMOUNT', { test: true, min_possible_payout: 50, amount: 10000, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x32, 0x00, 0x10, 0x27, 0x00, 0x00, 0x45, 0x55, 0x52, 0x19]))
  })

  test('SET_COIN_MECH_INHIBITS: protocol < 6', () => {
    const result = argsToByte('SET_COIN_MECH_INHIBITS', { inhibited: true, amount: 100 }, 5)
    expect(result).toEqual(Buffer.from([0x00, 0x64, 0x00]))
  })

  test('SET_COIN_MECH_INHIBITS: protocol >= 6', () => {
    const result = argsToByte('SET_COIN_MECH_INHIBITS', { inhibited: false, amount: 50, country_code: 'EUR' }, 6)
    expect(result).toEqual(Buffer.from([0x01, 0x32, 0x00, 0x45, 0x55, 0x52]))
  })

  test('FLOAT_BY_DENOMINATION', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('FLOAT_BY_DENOMINATION', { value }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x58,
      ]),
    )
  })

  test('FLOAT_BY_DENOMINATION: test', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('FLOAT_BY_DENOMINATION', { value, test: true }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x19,
      ]),
    )
  })

  test('PAYOUT_BY_DENOMINATION', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('PAYOUT_BY_DENOMINATION', { value }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x58,
      ]),
    )
  })

  test('PAYOUT_BY_DENOMINATION: test', () => {
    const value = [
      { number: 4, denomination: 100, country_code: 'EUR' },
      { number: 5, denomination: 10, country_code: 'EUR' },
      { number: 3, denomination: 100, country_code: 'GBP' },
      { number: 2, denomination: 50, country_code: 'GBP' },
    ]

    const result = argsToByte('PAYOUT_BY_DENOMINATION', { value, test: true }, 6)
    expect(result).toEqual(
      Buffer.from([
        0x04, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x05, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x03, 0x00, 0x64, 0x00,
        0x00, 0x00, 0x47, 0x42, 0x50, 0x02, 0x00, 0x32, 0x00, 0x00, 0x00, 0x47, 0x42, 0x50, 0x19,
      ]),
    )
  })

  test('SET_VALUE_REPORTING_TYPE: channel', () => {
    const result = argsToByte('SET_VALUE_REPORTING_TYPE', { reportBy: 'channel' }, 6)
    expect(result).toEqual(Buffer.from([0x01]))
  })

  test('SET_VALUE_REPORTING_TYPE: value', () => {
    const result = argsToByte('SET_VALUE_REPORTING_TYPE', { reportBy: 'value' }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('SET_BAUD_RATE: 9600', () => {
    const result = argsToByte('SET_BAUD_RATE', { baudrate: 9600, reset_to_default_on_reset: true }, 6)
    expect(result).toEqual(Buffer.from([0x00, 0x00]))
  })

  test('SET_BAUD_RATE: 38400', () => {
    const result = argsToByte('SET_BAUD_RATE', { baudrate: 38400, reset_to_default_on_reset: true }, 6)
    expect(result).toEqual(Buffer.from([0x01, 0x00]))
  })

  test('SET_BAUD_RATE: 115200', () => {
    const result = argsToByte('SET_BAUD_RATE', { baudrate: 115200, reset_to_default_on_reset: false }, 6)
    expect(result).toEqual(Buffer.from([0x02, 0x01]))
  })

  test('CONFIGURE_BEZEL: non volatile', () => {
    const result = argsToByte('CONFIGURE_BEZEL', { RGB: 'FF0000', volatile: false }, 6)
    expect(result).toEqual(Buffer.from([0xff, 0x00, 0x00, 0x01]))
  })

  test('CONFIGURE_BEZEL: volatile', () => {
    const result = argsToByte('CONFIGURE_BEZEL', { RGB: 'FF0000', volatile: true }, 6)
    expect(result).toEqual(Buffer.from([0xff, 0x00, 0x00, 0x00]))
  })

  test('ENABLE_PAYOUT_DEVICE: nv11', () => {
    const result = argsToByte('ENABLE_PAYOUT_DEVICE', { GIVE_VALUE_ON_STORED: true, NO_HOLD_NOTE_ON_PAYOUT: true }, 6)
    expect(result).toEqual(Buffer.from([0x03]))
  })

  test('ENABLE_PAYOUT_DEVICE: SMART Payout', () => {
    const result = argsToByte('ENABLE_PAYOUT_DEVICE', { REQUIRE_FULL_STARTUP: false, OPTIMISE_FOR_PAYIN_SPEED: false }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('SET_FIXED_ENCRYPTION_KEY', () => {
    const result = argsToByte('SET_FIXED_ENCRYPTION_KEY', { fixedKey: '0123456701234567' }, 6)
    expect(result).toEqual(Buffer.from([0x67, 0x45, 0x23, 0x01, 0x67, 0x45, 0x23, 0x01]))
  })

  test('COIN_MECH_OPTIONS', () => {
    const result = argsToByte('COIN_MECH_OPTIONS', { ccTalk: false }, 6)
    expect(result).toEqual(Buffer.from([0x00]))
  })

  test('COIN_MECH_OPTIONS: ccTalk', () => {
    const result = argsToByte('COIN_MECH_OPTIONS', { ccTalk: true }, 6)
    expect(result).toEqual(Buffer.from([0x01]))
  })

  test('empty if no args', () => {
    const result = argsToByte('RANDOM_COMMAND_TEST', undefined, 6)
    expect(result).toEqual(Buffer.alloc(0))
  })

  test('empty if unknown command', () => {
    const result = argsToByte('RANDOM_COMMAND_TEST', { param: true }, 6)
    expect(result).toEqual(Buffer.alloc(0))
  })
})
