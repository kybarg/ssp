const { parseData } = require('./utils')

describe('parseData', () => {
  describe('GENERIC responses', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('UNDEFINED STATUS', () => {
      const data = [0xff]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'UNDEFINED',
        success: false,
      })
    })

    test('COMMAND_NOT_KNOWN', () => {
      const data = [0xf2]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'COMMAND_NOT_KNOWN',
        success: false,
      })
    })

    test('WRONG_NO_PARAMETERS', () => {
      const data = [0xf3]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'WRONG_NO_PARAMETERS',
        success: false,
      })
    })

    test('PARAMETER_OUT_OF_RANGE', () => {
      const data = [0xf4]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'PARAMETER_OUT_OF_RANGE',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED', () => {
      const data = [0xf5]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('SOFTWARE_ERROR', () => {
      const data = [0xf6]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'SOFTWARE_ERROR',
        success: false,
      })
    })

    test('FAIL', () => {
      const data = [0xf8]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'FAIL',
        success: false,
      })
    })

    test('KEY_NOT_SET', () => {
      const data = [0xfa]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'KEY_NOT_SET',
        success: false,
      })
    })
  })

  describe('RESET_FIXED_ENCRYPTION_KEY', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'RESET_FIXED_ENCRYPTION_KEY', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'RESET_FIXED_ENCRYPTION_KEY',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('SET_FIXED_ENCRYPTION_KEY', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_FIXED_ENCRYPTION_KEY', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_FIXED_ENCRYPTION_KEY',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('ENABLE_PAYOUT_DEVICE', () => {
    test('No device connected', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'ENABLE_PAYOUT_DEVICE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE_PAYOUT_DEVICE',
        info: {
          error: 'No device connected',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('Invalid currency detected', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'ENABLE_PAYOUT_DEVICE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE_PAYOUT_DEVICE',
        info: {
          error: 'Invalid currency detected',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('Device busy', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'ENABLE_PAYOUT_DEVICE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE_PAYOUT_DEVICE',
        info: {
          error: 'Device busy',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('Empty only (Note float only)', () => {
      const data = [0xf5, 0x04]
      const result = parseData(data, 'ENABLE_PAYOUT_DEVICE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE_PAYOUT_DEVICE',
        info: {
          error: 'Empty only (Note float only)',
          errorCode: 4,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('Device error', () => {
      const data = [0xf5, 0x05]
      const result = parseData(data, 'ENABLE_PAYOUT_DEVICE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE_PAYOUT_DEVICE',
        info: {
          error: 'Device error',
          errorCode: 5,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('Unknown error', () => {
      const data = [0xf5, 0xff]
      const result = parseData(data, 'ENABLE_PAYOUT_DEVICE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE_PAYOUT_DEVICE',
        info: {
          error: 'Unknown error',
          errorCode: 255,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('DISABLE_PAYOUT_DEVICE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'DISABLE_PAYOUT_DEVICE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'DISABLE_PAYOUT_DEVICE',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('COIN_MECH_OPTONS', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'COIN_MECH_OPTONS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'COIN_MECH_OPTONS',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('RESET_COUNTERS', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'RESET_COUNTERS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'RESET_COUNTERS',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_COUNTERS', () => {
    test('OK', () => {
      const data = [
        0xf0, 0x05, 0x2c, 0x01, 0x00, 0x00, 0xd2, 0x00, 0x00, 0x00, 0xb4, 0x00, 0x00, 0x00, 0x68, 0x01, 0x00, 0x00, 0x19, 0x00, 0x00, 0x00,
      ]
      const result = parseData(data, 'GET_COUNTERS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_COUNTERS',
        info: {
          dispensed: 180,
          rejected: 25,
          stacked: 300,
          stored: 210,
          transferred_from_store_to_stacker: 360,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('EVENT_ACK', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'EVENT_ACK', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'EVENT_ACK',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('POLL_WITH_ACK', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'POLL_WITH_ACK', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL_WITH_ACK',
        info: [],
        status: 'OK',
        success: true,
      })
    })
  })

  describe('CONFIGURE_BEZEL', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'CONFIGURE_BEZEL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CONFIGURE_BEZEL',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_NOT_KNOWN', () => {
      const data = [0xf2]
      const result = parseData(data, 'CONFIGURE_BEZEL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CONFIGURE_BEZEL',
        info: {},
        status: 'COMMAND_NOT_KNOWN',
        success: false,
      })
    })
  })

  describe('CASHBOX_PAYOUT_OPERATION_DATA', () => {
    test('OK', () => {
      const data = [
        240, 7, 0, 0, 100, 0, 0, 0, 85, 83, 68, 0, 0, 200, 0, 0, 0, 85, 83, 68, 1, 0, 244, 1, 0, 0, 85, 83, 68, 0, 0, 232, 3, 0, 0, 85, 83, 68, 0, 0,
        208, 7, 0, 0, 85, 83, 68, 0, 0, 136, 19, 0, 0, 85, 83, 68, 0, 0, 16, 39, 0, 0, 85, 83, 68, 0, 0, 0, 0,
      ]
      const result = parseData(data, 'CASHBOX_PAYOUT_OPERATION_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CASHBOX_PAYOUT_OPERATION_DATA',
        info: {
          data: [
            {
              country_code: 'USD',
              quantity: 0,
              value: 100,
            },
            {
              country_code: 'USD',
              quantity: 0,
              value: 200,
            },
            {
              country_code: 'USD',
              quantity: 1,
              value: 500,
            },
            {
              country_code: 'USD',
              quantity: 0,
              value: 1000,
            },
            {
              country_code: 'USD',
              quantity: 0,
              value: 2000,
            },
            {
              country_code: 'USD',
              quantity: 0,
              value: 5000,
            },
            {
              country_code: 'USD',
              quantity: 0,
              value: 10000,
            },
          ],
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('SMART_EMPTY', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SMART_EMPTY', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SMART_EMPTY',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_HOPPER_OPTIONS', () => {
    test('OK', () => {
      const data = [0xf0, 0x04, 0x00]
      const result = parseData(data, 'GET_HOPPER_OPTIONS', 6, 'Smart Hopper')

      expect(result).toEqual({
        command: 'GET_HOPPER_OPTIONS',
        info: {
          cashBoxPayAcive: false,
          levelCheck: false,
          motorSpeed: true,
          payMode: false,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_BUILD_REVISION', () => {
    test('NV200', () => {
      const data = [0xf0, 0x00, 0x14, 0x00, 0x06, 0x15, 0x00]
      const result = parseData(data, 'GET_BUILD_REVISION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BUILD_REVISION',
        info: {
          device: {
            0: {
              revision: 20,
              unitType: 'Banknote validator',
            },
            1: {
              revision: 21,
              unitType: 'SMART payout fitted',
            },
          },
        },
        status: 'OK',
        success: true,
      })
    })

    test('NV11', () => {
      const data = [0xf0, 0x00, 0x00, 0x00, 0x03, 0x08, 0x00]
      const result = parseData(data, 'GET_BUILD_REVISION', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'GET_BUILD_REVISION',
        info: {
          device: {
            0: {
              revision: 0,
              unitType: 'Banknote validator',
            },
            1: {
              revision: 8,
              unitType: 'Smart Hopper',
            },
          },
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('SET_BAUD_RATE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_BAUD_RATE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_BAUD_RATE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_NOT_KNOWN', () => {
      const data = [0xf2]
      const result = parseData(data, 'SET_BAUD_RATE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_BAUD_RATE',
        info: {},
        status: 'COMMAND_NOT_KNOWN',
        success: false,
      })
    })
  })

  describe('REQUEST_KEY_EXCHANGE', () => {
    test('OK', () => {
      const data = [0xf0, 0xcb, 0xe1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
      const result = parseData(data, 'REQUEST_KEY_EXCHANGE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'REQUEST_KEY_EXCHANGE',
        info: {
          key: [203, 225, 0, 0, 0, 0, 0, 0],
        },
        status: 'OK',
        success: true,
      })
    })

    test('FAIL', () => {
      const data = [0xf8]
      const result = parseData(data, 'REQUEST_KEY_EXCHANGE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'REQUEST_KEY_EXCHANGE',
        info: {},
        status: 'FAIL',
        success: false,
      })
    })
  })

  describe('SET_MODULUS', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_MODULUS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_MODULUS',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('PARAMETER_OUT_OF_RANGE', () => {
      const data = [0xf4]
      const result = parseData(data, 'SET_MODULUS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_MODULUS',
        info: {},
        status: 'PARAMETER_OUT_OF_RANGE',
        success: false,
      })
    })
  })

  describe('SET_GENERATOR', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_GENERATOR', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_GENERATOR',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('PARAMETER_OUT_OF_RANGE', () => {
      const data = [0xf4]
      const result = parseData(data, 'SET_GENERATOR', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_GENERATOR',
        info: {},
        status: 'PARAMETER_OUT_OF_RANGE',
        success: false,
      })
    })
  })

  describe('SET_COIN_MECH_GLOBAL_INHIBIT', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_COIN_MECH_GLOBAL_INHIBIT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_COIN_MECH_GLOBAL_INHIBIT',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('PAYOUT_BY_DENOMINATION', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'PAYOUT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_BY_DENOMINATION',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Not enough value in device', () => {
      const data = [0xf5, 0x00]
      const result = parseData(data, 'PAYOUT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_BY_DENOMINATION',
        info: {
          error: 'Not enough value in device',
          errorCode: 0,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Cannot pay exact amount', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'PAYOUT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_BY_DENOMINATION',
        info: {
          error: 'Cannot pay exact amount',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device busy', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'PAYOUT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_BY_DENOMINATION',
        info: {
          error: 'Device busy',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device disabled', () => {
      const data = [0xf5, 0x04]
      const result = parseData(data, 'PAYOUT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_BY_DENOMINATION',
        info: {
          error: 'Device disabled',
          errorCode: 4,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Unknown error', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'PAYOUT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_BY_DENOMINATION',
        info: {
          error: 'Unknown error',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('SET_VALUE_REPORTING_TYPE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_VALUE_REPORTING_TYPE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_VALUE_REPORTING_TYPE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: No payout connected', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'SET_VALUE_REPORTING_TYPE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_VALUE_REPORTING_TYPE',
        info: {
          error: 'No payout connected',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Invalid currency detected', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'SET_VALUE_REPORTING_TYPE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_VALUE_REPORTING_TYPE',
        info: {
          error: 'Invalid currency detected',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Payout device error', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'SET_VALUE_REPORTING_TYPE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_VALUE_REPORTING_TYPE',
        info: {
          error: 'Payout device error',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('FLOAT_BY_DENOMINATION', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'FLOAT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_BY_DENOMINATION',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Not enough value in device', () => {
      const data = [0xf5, 0x00]
      const result = parseData(data, 'FLOAT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_BY_DENOMINATION',
        info: {
          error: 'Not enough value in device',
          errorCode: 0,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Cannot pay exact amount', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'FLOAT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_BY_DENOMINATION',
        info: {
          error: 'Cannot pay exact amount',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device busy', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'FLOAT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_BY_DENOMINATION',
        info: {
          error: 'Device busy',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device disabled', () => {
      const data = [0xf5, 0x04]
      const result = parseData(data, 'FLOAT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_BY_DENOMINATION',
        info: {
          error: 'Device disabled',
          errorCode: 4,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Unknown error', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'FLOAT_BY_DENOMINATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_BY_DENOMINATION',
        info: {
          error: 'Unknown error',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('STACK_NOTE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'STACK_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'STACK_NOTE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float unit not connected', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'STACK_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'STACK_NOTE',
        info: {
          error: 'Note float unit not connected',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float empty', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'STACK_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'STACK_NOTE',
        info: {
          error: 'Note float empty',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float busy', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'STACK_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'STACK_NOTE',
        info: {
          error: 'Note float busy',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float disabled', () => {
      const data = [0xf5, 0x04]
      const result = parseData(data, 'STACK_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'STACK_NOTE',
        info: {
          error: 'Note float disabled',
          errorCode: 4,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Unknown error', () => {
      const data = [0xf5, 0xff]
      const result = parseData(data, 'STACK_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'STACK_NOTE',
        info: {
          error: 'Unknown error',
          errorCode: 255,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('PAYOUT_NOTE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'PAYOUT_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'PAYOUT_NOTE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float unit not connected', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'PAYOUT_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'PAYOUT_NOTE',
        info: {
          error: 'Note float unit not connected',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float empty', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'PAYOUT_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'PAYOUT_NOTE',
        info: {
          error: 'Note float empty',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float busy', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'PAYOUT_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'PAYOUT_NOTE',
        info: {
          error: 'Note float busy',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Note float disabled', () => {
      const data = [0xf5, 0x04]
      const result = parseData(data, 'PAYOUT_NOTE', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'PAYOUT_NOTE',
        info: {
          error: 'Note float disabled',
          errorCode: 4,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('GET_NOTE_POSITIONS', () => {
    test('OK: Report by value', () => {
      const data = [0xf0, 0x02, 0xf4, 0x01, 0x00, 0x00, 0xe8, 0x03, 0x00, 0x00]
      const result = parseData(data, 'GET_NOTE_POSITIONS', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'GET_NOTE_POSITIONS',
        info: {
          slot: {
            1: {
              value: 500,
            },
            2: {
              value: 1000,
            },
          },
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: Report by channel', () => {
      const data = [0xf0, 0x02, 0x01, 0x02]
      const result = parseData(data, 'GET_NOTE_POSITIONS', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'GET_NOTE_POSITIONS',
        info: {
          slot: {
            1: {
              channel: 1,
            },
            2: {
              channel: 2,
            },
          },
        },
        status: 'OK',
        success: true,
      })
    })

    test('ERROR: 1', () => {
      const data = [0xf5, 0x01]

      const result = parseData(data, 'GET_NOTE_POSITIONS', 6, 'Note Float fitted')
      expect(result).toEqual({
        command: 'GET_NOTE_POSITIONS',
        info: {
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('ERROR: 2', () => {
      const data = [0xf5, 0x02]

      const result = parseData(data, 'GET_NOTE_POSITIONS', 6, 'Note Float fitted')
      expect(result).toEqual({
        command: 'GET_NOTE_POSITIONS',
        info: {
          error: 'Invalid currency',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('SET_COIN_MECH_INHIBITS', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_COIN_MECH_INHIBITS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_COIN_MECH_INHIBITS',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('EMPTY_ALL response', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'EMPTY_ALL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'EMPTY_ALL',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_MINIMUM_PAYOUT', () => {
    test('OK', () => {
      const data = [0xf0, 0xc8, 0x00, 0x00, 0x00]
      const result = parseData(data, 'GET_MINIMUM_PAYOUT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_MINIMUM_PAYOUT',
        info: {
          value: 200,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('FLOAT_AMOUNT', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'FLOAT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_AMOUNT',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Not enough value in device', () => {
      const data = [0xf5, 0x00]
      const result = parseData(data, 'FLOAT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_AMOUNT',
        info: {
          error: 'Not enough value in device',
          errorCode: 0,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Cannot pay exact amount', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'FLOAT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_AMOUNT',
        info: {
          error: 'Cannot pay exact amount',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Unknown error', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'FLOAT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_AMOUNT',
        info: {
          error: 'Unknown error',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device busy', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'FLOAT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_AMOUNT',
        info: {
          error: 'Device busy',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device disabled', () => {
      const data = [0xf5, 0x04]
      const result = parseData(data, 'FLOAT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'FLOAT_AMOUNT',
        info: {
          error: 'Device disabled',
          errorCode: 4,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('GET_DENOMINATION_ROUTE', () => {
    test('OK: Recycled and used for payouts', () => {
      const data = [0xf0, 0x00]
      const result = parseData(data, 'GET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_ROUTE',
        info: {
          code: 0,
          value: 'Recycled and used for payouts',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: Detected denomination is routed to system cashbox', () => {
      const data = [0xf0, 0x01]
      const result = parseData(data, 'GET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_ROUTE',
        info: {
          code: 1,
          value: 'Detected denomination is routed to system cashbox',
        },
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: No payout connected', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'GET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_ROUTE',
        info: {
          errorCode: 1,
          error: 'No payout connected',
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Invalid currency detected', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'GET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_ROUTE',
        info: {
          errorCode: 2,
          error: 'Invalid currency detected',
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Payout device error', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'GET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_ROUTE',
        info: {
          errorCode: 3,
          error: 'Payout device error',
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Unknown error', () => {
      const data = [0xf5, 0xff]
      const result = parseData(data, 'GET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_ROUTE',
        info: {
          errorCode: 255,
          error: 'Unknown error',
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('PARAMETER_OUT_OF_RANGE', () => {
      const data = [0xf4]
      const result = parseData(data, 'GET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_ROUTE',
        info: {},
        status: 'PARAMETER_OUT_OF_RANGE',
        success: false,
      })
    })
  })

  describe('SET_DENOMINATION_ROUTE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_DENOMINATION_ROUTE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: No payout connected', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'SET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_DENOMINATION_ROUTE',
        info: {
          errorCode: 1,
          error: 'No payout connected',
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Invalid currency detected', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'SET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_DENOMINATION_ROUTE',
        info: {
          errorCode: 2,
          error: 'Invalid currency detected',
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Payout device error', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'SET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_DENOMINATION_ROUTE',
        info: {
          errorCode: 3,
          error: 'Payout device error',
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('PARAMETER_OUT_OF_RANGE', () => {
      const data = [0xf4]
      const result = parseData(data, 'SET_DENOMINATION_ROUTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_DENOMINATION_ROUTE',
        info: {},
        status: 'PARAMETER_OUT_OF_RANGE',
        success: false,
      })
    })
  })

  describe('HALT_PAYOUT', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'HALT_PAYOUT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'HALT_PAYOUT',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('COMMUNICATION_PASS_THROUGH', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'COMMUNICATION_PASS_THROUGH', 6, 'Smart Hopper')

      expect(result).toEqual({
        command: 'COMMUNICATION_PASS_THROUGH',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_DENOMINATION_LEVEL', () => {
    test('OK', () => {
      const data = [0xf0, 0xc8, 0x00]
      const result = parseData(data, 'GET_DENOMINATION_LEVEL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_LEVEL',
        info: {
          level: 200,
        },
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED', () => {
      const data = [0xf5]
      const result = parseData(data, 'GET_DENOMINATION_LEVEL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DENOMINATION_LEVEL',
        info: {},
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('SET_DENOMINATION_LEVEL', () => {
    test('OK', () => {
      const data = [0xf0, 0xc8, 0x00]
      const result = parseData(data, 'SET_DENOMINATION_LEVEL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_DENOMINATION_LEVEL',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED', () => {
      const data = [0xf5]
      const result = parseData(data, 'SET_DENOMINATION_LEVEL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_DENOMINATION_LEVEL',
        info: {},
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('PAYOUT_AMOUNT', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'PAYOUT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_AMOUNT',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Not enough value in device', () => {
      const data = [0xf5, 0x00]
      const result = parseData(data, 'PAYOUT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_AMOUNT',
        info: {
          error: 'Not enough value in device',
          errorCode: 0,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Cannot pay exact amount', () => {
      const data = [0xf5, 0x01]
      const result = parseData(data, 'PAYOUT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_AMOUNT',
        info: {
          error: 'Cannot pay exact amount',
          errorCode: 1,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Unknown error', () => {
      const data = [0xf5, 0x02]
      const result = parseData(data, 'PAYOUT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_AMOUNT',
        info: {
          error: 'Unknown error',
          errorCode: 2,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device busy', () => {
      const data = [0xf5, 0x03]
      const result = parseData(data, 'PAYOUT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_AMOUNT',
        info: {
          error: 'Device busy',
          errorCode: 3,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED: Device disabled', () => {
      const data = [0xf5, 0x04]
      const result = parseData(data, 'PAYOUT_AMOUNT', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'PAYOUT_AMOUNT',
        info: {
          error: 'Device disabled',
          errorCode: 4,
        },
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('SET_REFILL_MODE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_REFILL_MODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_REFILL_MODE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('OK: read mode', () => {
      const data = [0xf0, 0x01]
      const result = parseData(data, 'SET_REFILL_MODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_REFILL_MODE',
        info: {
          enabled: true,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_BAR_CODE_DATA', () => {
    test('OK: ticket_in_escrow', () => {
      const data = [0xf0, 0x01, 0x06, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36]
      const result = parseData(data, 'GET_BAR_CODE_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_DATA',
        info: {
          data: '123456',
          status: 'ticket_in_escrow',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: ticket_stacked', () => {
      const data = [0xf0, 0x02, 0x06, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36]
      const result = parseData(data, 'GET_BAR_CODE_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_DATA',
        info: {
          data: '123456',
          status: 'ticket_stacked',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: ticket_rejected', () => {
      const data = [0xf0, 0x03, 0x06, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36]
      const result = parseData(data, 'GET_BAR_CODE_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_DATA',
        info: {
          data: '123456',
          status: 'ticket_rejected',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: no_valid_data', () => {
      const data = [0xf0, 0x00, 0x00]
      const result = parseData(data, 'GET_BAR_CODE_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_DATA',
        info: {
          data: '',
          status: 'no_valid_data',
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('SET_BAR_CODE_INHIBIT_STATUS', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_BAR_CODE_INHIBIT_STATUS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_BAR_CODE_INHIBIT_STATUS',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_BAR_CODE_INHIBIT_STATUS', () => {
    test('OK: enabled', () => {
      const data = [0xf0, 0xfc]
      const result = parseData(data, 'GET_BAR_CODE_INHIBIT_STATUS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_INHIBIT_STATUS',
        info: {
          bar_code_enable: true,
          currency_read_enable: true,
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: disabled', () => {
      const data = [0xf0, 0xff]
      const result = parseData(data, 'GET_BAR_CODE_INHIBIT_STATUS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_INHIBIT_STATUS',
        info: {
          bar_code_enable: false,
          currency_read_enable: false,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('SET_BAR_CODE_CONFIGURATION', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_BAR_CODE_CONFIGURATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_BAR_CODE_CONFIGURATION',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_BAR_CODE_READER_CONFIGURATION', () => {
    test('OK: none', () => {
      const data = [0xf0, 0x00, 0x00, 0x01, 0x06]
      const result = parseData(data, 'GET_BAR_CODE_READER_CONFIGURATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_READER_CONFIGURATION',
        info: {
          bar_code_format: 'Interleaved 2 of 5',
          bar_code_hardware_status: 'none',
          number_of_characters: 6,
          readers_enabled: 'none',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: top', () => {
      const data = [0xf0, 0x01, 0x01, 0x01, 0x06]
      const result = parseData(data, 'GET_BAR_CODE_READER_CONFIGURATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_READER_CONFIGURATION',
        info: {
          bar_code_format: 'Interleaved 2 of 5',
          bar_code_hardware_status: 'Top reader fitted',
          number_of_characters: 6,
          readers_enabled: 'top',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: bottom', () => {
      const data = [0xf0, 0x02, 0x02, 0x01, 0x06]
      const result = parseData(data, 'GET_BAR_CODE_READER_CONFIGURATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_READER_CONFIGURATION',
        info: {
          bar_code_format: 'Interleaved 2 of 5',
          bar_code_hardware_status: 'Bottom reader fitted',
          number_of_characters: 6,
          readers_enabled: 'bottom',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: both', () => {
      const data = [0xf0, 0x03, 0x03, 0x01, 0x06]
      const result = parseData(data, 'GET_BAR_CODE_READER_CONFIGURATION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_BAR_CODE_READER_CONFIGURATION',
        info: {
          bar_code_format: 'Interleaved 2 of 5',
          bar_code_hardware_status: 'both fitted',
          number_of_characters: 6,
          readers_enabled: 'both',
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_ALL_LEVELS', () => {
    test('OK', () => {
      const data = [
        0xf0, 0x04, 0x64, 0x00, 0x14, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x41, 0x00, 0x32, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x00, 0x00, 0x64,
        0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x0c, 0x00, 0xc8, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52, 0x84, 0xd0,
      ]
      const result = parseData(data, 'GET_ALL_LEVELS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_ALL_LEVELS',
        info: {
          counter: {
            1: {
              country_code: 'EUR',
              denomination_level: 100,
              value: 20,
            },
            2: {
              country_code: 'EUR',
              denomination_level: 65,
              value: 50,
            },
            3: {
              country_code: 'EUR',
              denomination_level: 0,
              value: 100,
            },
            4: {
              country_code: 'EUR',
              denomination_level: 12,
              value: 200,
            },
          },
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_DATASET_VERSION', () => {
    test('OK', () => {
      const data = [0xf0, 0x45, 0x55, 0x52, 0x30, 0x31, 0x36, 0x31, 0x30]
      const result = parseData(data, 'GET_DATASET_VERSION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_DATASET_VERSION',
        info: {
          version: 'EUR01610',
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_FIRMWARE_VERSION', () => {
    test('OK', () => {
      const data = [0xf0, 0x4e, 0x56, 0x30, 0x32, 0x30, 0x30, 0x34, 0x31, 0x34, 0x31, 0x34, 0x39, 0x38, 0x30, 0x30, 0x30]
      const result = parseData(data, 'GET_FIRMWARE_VERSION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_FIRMWARE_VERSION',
        info: {
          version: 'NV02004141498000',
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('HOLD', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'HOLD', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'HOLD',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED', () => {
      const data = [0xf5]
      const result = parseData(data, 'HOLD', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'HOLD',
        info: {},
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('LAST_REJECT_CODE', () => {
    test('OK: NOTE_ACCEPTED', () => {
      const data = [0xf0, 0x0]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 0,
          description: 'The banknote has been accepted. No reject has occured.',
          name: 'NOTE_ACCEPTED',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: LENGTH_FAIL', () => {
      const data = [0xf0, 0x1]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 1,
          description: "A validation fail: The banknote has been read but it's length registers over the max length parameter.",
          name: 'LENGTH_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: AVERAGE_FAIL', () => {
      const data = [0xf0, 0x2]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 2,
          description: 'Internal validation failure - banknote not recognised.',
          name: 'AVERAGE_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: COASTLINE_FAIL', () => {
      const data = [0xf0, 0x3]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 3,
          description: 'Internal validation failure - banknote not recognised.',
          name: 'COASTLINE_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: GRAPH_FAIL', () => {
      const data = [0xf0, 0x4]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 4,
          description: 'Internal validation failure - banknote not recognised.',
          name: 'GRAPH_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: BURIED_FAIL', () => {
      const data = [0xf0, 0x5]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 5,
          description: 'Internal validation failure - banknote not recognised.',
          name: 'BURIED_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: CHANNEL_INHIBIT', () => {
      const data = [0xf0, 0x6]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 6,
          description: 'This banknote has been inhibited for acceptance in the dataset configuration.',
          name: 'CHANNEL_INHIBIT',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: SECOND_NOTE_DETECTED', () => {
      const data = [0xf0, 0x7]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 7,
          description: 'A second banknote was inserted into the validator while the first one was still being transported through the banknote path.',
          name: 'SECOND_NOTE_DETECTED',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: REJECT_BY_HOST', () => {
      const data = [0xf0, 0x8]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 8,
          description: 'The host system issues a Reject command when this banknote was held in escrow.',
          name: 'REJECT_BY_HOST',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: CROSS_CHANNEL_DETECTED', () => {
      const data = [0xf0, 0x9]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 9,
          description: 'This bank note was identified as exisiting in two or more seperate channel definitions in the dataset.',
          name: 'CROSS_CHANNEL_DETECTED',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: REAR_SENSOR_ERROR', () => {
      const data = [0xf0, 0xa]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 10,
          description: 'An inconsistency in a position sensor detection was seen',
          name: 'REAR_SENSOR_ERROR',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: NOTE_TOO_LONG', () => {
      const data = [0xf0, 0xb]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 11,
          description: 'The banknote failed dataset length checks.',
          name: 'NOTE_TOO_LONG',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: DISABLED_BY_HOST', () => {
      const data = [0xf0, 0xc]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 12,
          description: 'The bank note was validated on a channel that has been inhibited for acceptance by the host system.',
          name: 'DISABLED_BY_HOST',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: SLOW_MECH', () => {
      const data = [0xf0, 0xd]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 13,
          description: 'The internal mechanism was detected as moving too slowly for correct validation.',
          name: 'SLOW_MECH',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: STRIM_ATTEMPT', () => {
      const data = [0xf0, 0xe]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 14,
          description: 'The internal mechanism was detected as moving too slowly for correct validation.',
          name: 'STRIM_ATTEMPT',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: FRAUD_CHANNEL', () => {
      const data = [0xf0, 0xf]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 15,
          description: 'Obselete response.',
          name: 'FRAUD_CHANNEL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: NO_NOTES_DETECTED', () => {
      const data = [0xf0, 0x10]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 16,
          description: 'A banknote detection was initiated but no banknotes were seen at the validation section.',
          name: 'NO_NOTES_DETECTED',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: PEAK_DETECT_FAIL', () => {
      const data = [0xf0, 0x11]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 17,
          description: 'Internal validation fail. Banknote not recognised.',
          name: 'PEAK_DETECT_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: TWISTED_NOTE_REJECT', () => {
      const data = [0xf0, 0x12]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 18,
          description: 'Internal validation fail. Banknote not recognised.',
          name: 'TWISTED_NOTE_REJECT',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: ESCROW_TIME-OUT', () => {
      const data = [0xf0, 0x13]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 19,
          description: 'A banknote held in escrow was rejected due to the host not communicating within the timeout period.',
          name: 'ESCROW_TIME-OUT',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: BAR_CODE_SCAN_FAIL', () => {
      const data = [0xf0, 0x14]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 20,
          description: 'Internal validation fail. Banknote not recognised.',
          name: 'BAR_CODE_SCAN_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: NO_CAM_ACTIVATE', () => {
      const data = [0xf0, 0x15]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 21,
          description: 'A banknote did not reach the internal note path for validation during transport.',
          name: 'NO_CAM_ACTIVATE',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: SLOT_FAIL_1', () => {
      const data = [0xf0, 0x16]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 22,
          description: 'Internal validation fail. Banknote not recognised.',
          name: 'SLOT_FAIL_1',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: SLOT_FAIL_2', () => {
      const data = [0xf0, 0x17]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 23,
          description: 'Internal validation fail. Banknote not recognised.',
          name: 'SLOT_FAIL_2',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: LENS_OVERSAMPLE', () => {
      const data = [0xf0, 0x18]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 24,
          description: 'The banknote was transported faster than the system could sample the note.',
          name: 'LENS_OVERSAMPLE',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: WIDTH_DETECTION_FAIL', () => {
      const data = [0xf0, 0x19]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 25,
          description: 'The banknote failed a measurement test.',
          name: 'WIDTH_DETECTION_FAIL',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: SHORT_NOTE_DETECT', () => {
      const data = [0xf0, 0x1a]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 26,
          description: 'The banknote measured length fell outside of the validation parameter for minimum length.',
          name: 'SHORT_NOTE_DETECT',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: PAYOUT_NOTE', () => {
      const data = [0xf0, 0x1b]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 27,
          description: 'The reject code cammand was issued after a note was payed out using a note payout device.',
          name: 'PAYOUT_NOTE',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: DOUBLE_NOTE_DETECTED', () => {
      const data = [0xf0, 0x1c]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 28,
          description: 'Mote than one banknote was detected as overlayed during note entry.',
          name: 'DOUBLE_NOTE_DETECTED',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: UNABLE_TO_STACK', () => {
      const data = [0xf0, 0x1d]
      const result = parseData(data, 'LAST_REJECT_CODE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'LAST_REJECT_CODE',
        info: {
          code: 29,
          description: "The bank was unable to reach it's correct stacking position during transport",
          name: 'UNABLE_TO_STACK',
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('SYNC', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SYNC', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SYNC',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('CHANNEL_RE_TEACH_DATA', () => {
    test('OK', () => {
      const data = [0xf0, 0x00, 0x00, 0x00]
      const result = parseData(data, 'CHANNEL_RE_TEACH_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CHANNEL_RE_TEACH_DATA',
        info: {
          source: [0, 0, 0],
        },
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_NOT_KNOWN', () => {
      const data = [0xf2]
      const result = parseData(data, 'CHANNEL_RE_TEACH_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CHANNEL_RE_TEACH_DATA',
        info: {},
        status: 'COMMAND_NOT_KNOWN',
        success: false,
      })
    })
  })

  describe('CHANNEL_SECURITY_DATA', () => {
    test('OK', () => {
      const data = [0xf0, 0x07, 0x02, 0x02, 0x00, 0x02, 0x00, 0x02, 0x02]
      const result = parseData(data, 'CHANNEL_SECURITY_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CHANNEL_SECURITY_DATA',
        info: {
          channel: {
            1: 'std',
            2: 'std',
            3: 'not_implemented',
            4: 'std',
            5: 'not_implemented',
            6: 'std',
            7: 'std',
          },
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('CHANNEL_VALUE_REQUEST', () => {
    test('OK: protocol < 6', () => {
      const data = [0xf0, 0x07, 0x05, 0x0a, 0x00, 0x14, 0x00, 0x32, 0x64]
      const result = parseData(data, 'CHANNEL_VALUE_REQUEST', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CHANNEL_VALUE_REQUEST',
        info: {
          channel: [5, 10, 0, 20, 0, 50, 100],
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: protocol >= 6', () => {
      const data = [
        240, 7, 1, 2, 5, 10, 20, 50, 100, 85, 83, 68, 85, 83, 68, 85, 83, 68, 85, 83, 68, 85, 83, 68, 85, 83, 68, 85, 83, 68, 1, 0, 0, 0, 2, 0, 0, 0,
        5, 0, 0, 0, 10, 0, 0, 0, 20, 0, 0, 0, 50, 0, 0, 0, 100, 0, 0, 0,
      ]
      const result = parseData(data, 'CHANNEL_VALUE_REQUEST', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'CHANNEL_VALUE_REQUEST',
        info: {
          channel: [1, 2, 5, 10, 20, 50, 100],
          country_code: ['USD', 'USD', 'USD', 'USD', 'USD', 'USD', 'USD'],
          value: [1, 2, 5, 10, 20, 50, 100],
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('UNIT_DATA', () => {
    test('OK', () => {
      const data = [240, 6, 48, 52, 53, 57, 85, 83, 68, 0, 0, 1, 6]
      const result = parseData(data, 'UNIT_DATA', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'UNIT_DATA',
        info: {
          unit_type: 'SMART payout fitted',
          firmware_version: '4.59',
          country_code: 'USD',
          value_multiplier: 1,
          protocol_version: 6,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('GET_SERIAL_NUMBER', () => {
    test('OK', () => {
      const data = [240, 0, 74, 120, 180]
      const result = parseData(data, 'GET_SERIAL_NUMBER', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'GET_SERIAL_NUMBER',
        info: {
          serial_number: 4880564,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('ENABLE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'ENABLE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED', () => {
      const data = [0xf5]
      const result = parseData(data, 'ENABLE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'ENABLE',
        info: {},
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('DISABLE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'DISABLE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'DISABLE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED', () => {
      const data = [0xf5]
      const result = parseData(data, 'DISABLE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'DISABLE',
        info: {},
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('REJECT_BANKNOTE', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'REJECT_BANKNOTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'REJECT_BANKNOTE',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('COMMAND_CANNOT_BE_PROCESSED', () => {
      const data = [0xf5]
      const result = parseData(data, 'REJECT_BANKNOTE', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'REJECT_BANKNOTE',
        info: {},
        status: 'COMMAND_CANNOT_BE_PROCESSED',
        success: false,
      })
    })
  })

  describe('POLL', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [],
        status: 'OK',
        success: true,
      })
    })

    test('SLAVE_RESET', () => {
      const data = [0xf0, 0xf1]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 241,
            description: 'The device has undergone a power reset.',
            name: 'SLAVE_RESET',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('READ_NOTE', () => {
      const data = [0xf0, 0xef, 0x01]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            channel: 1,
            code: 239,
            description:
              'A note is in the process of being scanned by the device (byte value 0) or a valid note has been scanned and is in escrow (byte value gives the channel number)',
            name: 'READ_NOTE',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('CREDIT_NOTE', () => {
      const data = [0xf0, 0xee, 0x01]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            channel: 1,
            code: 238,
            description:
              'A note has passed through the device, past the point of possible recovery and the host can safely issue its credit amount. The byte value is the channel number of the note to credit.',
            name: 'CREDIT_NOTE',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_REJECTING', () => {
      const data = [0xf0, 0xed]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 237,
            description: 'The note is in the process of being rejected from the validator',
            name: 'NOTE_REJECTING',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_REJECTED', () => {
      const data = [0xf0, 0xec]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 236,
            description: 'The note has been rejected from the validator and is available for the user to retrieve.',
            name: 'NOTE_REJECTED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_STACKING', () => {
      const data = [0xf0, 0xcc]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 204,
            description: 'The note is being moved from the escrow position to the host exit section of the device.',
            name: 'NOTE_STACKING',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_STACKED', () => {
      const data = [0xf0, 0xeb]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 235,
            description: 'The note has exited the device on the host side or has been placed within its note stacker.',
            name: 'NOTE_STACKED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('SAFE_NOTE_JAM', () => {
      const data = [0xf0, 0xea]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 234,
            description: 'The note is stuck in a position not retrievable from the front of the device (user side)',
            name: 'SAFE_NOTE_JAM',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('UNSAFE_NOTE_JAM', () => {
      const data = [0xf0, 0xe9]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 233,
            description: 'The note is stuck in a position where the user could possibly remove it from the front of the device.',
            name: 'UNSAFE_NOTE_JAM',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('DISABLED', () => {
      const data = [0xf0, 0xe8]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 232,
            description: 'The device is not active and unavailable for normal validation functions.',
            name: 'DISABLED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('FRAUD_ATTEMPT: Banknote validator', () => {
      const data = [0xf0, 0xe6, 0x01]
      const result = parseData(data, 'POLL', 4, 'Banknote validator')

      expect(result).toEqual({
        command: 'POLL',

        info: [
          {
            channel: 1,
            code: 230,
            description: 'The device has detected an attempt to tamper with the normal validation/stacking/payout process.',
            name: 'FRAUD_ATTEMPT',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('FRAUD_ATTEMPT: Smart protocol < 6', () => {
      const data = [0xf0, 0xe6, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 4, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',

        info: [
          {
            code: 230,
            description: 'The device has detected an attempt to tamper with the normal validation/stacking/payout process.',
            name: 'FRAUD_ATTEMPT',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('FRAUD_ATTEMPT: Smart protocol >= 6', () => {
      const data = [0xf0, 0xe6, 0x02, 0x02, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x01, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',

        info: [
          {
            code: 230,
            description: 'The device has detected an attempt to tamper with the normal validation/stacking/payout process.',
            name: 'FRAUD_ATTEMPT',
            value: [
              { country_code: 'USD', value: 2 },
              { country_code: 'UAH', value: 1 },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('STACKER_FULL', () => {
      const data = [0xf0, 0xe7]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 231,
            description: 'The banknote stacker unit attached to this device has been detected as at its full limit',
            name: 'STACKER_FULL',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_CLEARED_FROM_FRONT', () => {
      const data = [0xf0, 0xe1, 0x01]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            channel: 1,
            code: 225,
            description:
              'At power-up, a note was detected as being rejected out of the front of the device. The channel value, if known is given in the data byte.',
            name: 'NOTE_CLEARED_FROM_FRONT',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_CLEARED_TO_CASHBOX', () => {
      const data = [0xf0, 0xe2, 0x01]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            channel: 1,
            code: 226,
            description:
              'At power up, a note was detected as being moved into the stacker unit or host exit of the device. The channel number of the note is given in the data byte if known.',
            name: 'NOTE_CLEARED_TO_CASHBOX',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('CASHBOX_REMOVED', () => {
      const data = [0xf0, 0xe3]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 227,
            description: 'A device with a detectable cashbox has detected that it has been removed.',
            name: 'CASHBOX_REMOVED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('CASHBOX_REPLACED', () => {
      const data = [0xf0, 0xe4]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 228,
            description: 'A device with a detectable cashbox has detected that it has been replaced.',
            name: 'CASHBOX_REPLACED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('BAR_CODE_TICKET_VALIDATED', () => {
      const data = [0xf0, 0xe5]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 229,
            description: 'A validated barcode ticket has been scanned and is available at the escrow point of the device.',
            name: 'BAR_CODE_TICKET_VALIDATED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('BAR_CODE_TICKET_ACKNOWLEDGE', () => {
      const data = [0xf0, 0xd1]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 209,
            description: 'The bar code ticket has been passed to a safe point in the device stacker.',
            name: 'BAR_CODE_TICKET_ACKNOWLEDGE',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_PATH_OPEN', () => {
      const data = [0xf0, 0xe0]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 224,
            description: 'The device has detected that its note transport path has been opened.',
            name: 'NOTE_PATH_OPEN',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('CHANNEL_DISABLE', () => {
      const data = [0xf0, 0xb5]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 181,
            description: 'The device has had all its note channels inhibited and has become disabled for note insertion.',
            name: 'CHANNEL_DISABLE',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('INITIALISING', () => {
      const data = [0xf0, 0xb6]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 182,
            description:
              'This event is given only when using the Poll with ACK command. It is given when the BNV is powered up and setting its sensors and mechanisms to be ready for Note acceptance. When the event response does not contain this event, the BNV is ready to be enabled and used.',
            name: 'INITIALISING',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('DISPENSING: protocol < 6', () => {
      const data = [0xf0, 0xda, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 218,
            description: 'The device is in the process of paying out a requested value. The value paid at the poll is given in the vent data.',
            name: 'DISPENSING',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('DISPENSING: protocol >= 6', () => {
      const data = [0xf0, 0xda, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x05, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 218,
            description: 'The device is in the process of paying out a requested value. The value paid at the poll is given in the vent data.',
            name: 'DISPENSING',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 5,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })
    // TODO: test NV11

    test('DISPENSED: protocol < 6', () => {
      const data = [0xf0, 0xd2, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 210,
            description: 'The device has completed its pay-out request. The final value paid is given in the event data.',
            name: 'DISPENSED',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('DISPENSED: protocol >= 6', () => {
      const data = [0xf0, 0xd2, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x05, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 210,
            description: 'The device has completed its pay-out request. The final value paid is given in the event data.',
            name: 'DISPENSED',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 5,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })
    // TODO: test NV11

    test('JAMMED: protocol < 6', () => {
      const data = [0xf0, 0xd5, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 213,
            description:
              'The device has detected that coins are jammed in its mechanism and cannot be removed other than by manual intervention. The value paid at the jam point is given in the event data.',
            name: 'JAMMED',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('JAMMED: protocol >= 6', () => {
      const data = [0xf0, 0xd5, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x05, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 213,
            description:
              'The device has detected that coins are jammed in its mechanism and cannot be removed other than by manual intervention. The value paid at the jam point is given in the event data.',
            name: 'JAMMED',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 5,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('JAMMED: NV11 protocol >= 6', () => {
      const data = [0xf0, 0xd5, 0x01, 0xe6, 0x00, 0x00, 0x00, 0x45, 0x55, 0x52]
      const result = parseData(data, 'POLL', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 213,
            description:
              'The device has detected that coins are jammed in its mechanism and cannot be removed other than by manual intervention. The value paid at the jam point is given in the event data.',
            name: 'JAMMED',
            value: [
              {
                country_code: 'EUR',
                value: 230,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('HALTED: protocol < 6', () => {
      const data = [0xf0, 0xd6, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 214,
            description:
              'This event is given when the host has requested a halt to the device. The value paid at the point of halting is given in the event data.',
            name: 'HALTED',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('HALTED: protocol >= 6', () => {
      const data = [0xf0, 0xd6, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x05, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 214,
            description:
              'This event is given when the host has requested a halt to the device. The value paid at the point of halting is given in the event data.',
            name: 'HALTED',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 5,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })
    // TODO: test NV11

    test('FLOATING: protocol < 6', () => {
      const data = [0xf0, 0xd7, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 215,
            description:
              'The device is in the process of executing a float command and the value paid to the cashbox at the poll time is given in the event data.',
            name: 'FLOATING',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('FLOATING: protocol >= 6', () => {
      const data = [0xf0, 0xd7, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x05, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 215,
            description:
              'The device is in the process of executing a float command and the value paid to the cashbox at the poll time is given in the event data.',
            name: 'FLOATING',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 5,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('FLOATED: protocol < 6', () => {
      const data = [0xf0, 0xd8, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 216,
            description: 'The device has completed its float command and the final value floated to the cashbox is given in the event data.',
            name: 'FLOATED',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('FLOATED: protocol >= 6', () => {
      const data = [0xf0, 0xd8, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x05, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 216,
            description: 'The device has completed its float command and the final value floated to the cashbox is given in the event data.',
            name: 'FLOATED',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 5,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('TIME_OUT: protocol < 6', () => {
      const data = [0xf0, 0xd9, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 217,
            description: 'The device has been unable to complete a request. The value paid up until the time-out point is given in the event data.',
            name: 'TIME_OUT',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('TIME_OUT: protocol >= 6', () => {
      const data = [0xf0, 0xd9, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x05, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 217,
            description: 'The device has been unable to complete a request. The value paid up until the time-out point is given in the event data.',
            name: 'TIME_OUT',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 5,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('INCOMPLETE_PAYOUT: protocol < 6', () => {
      const data = [0xf0, 0xdc, 0x01, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 220,
            description:
              'The device has detected a discrepancy on power-up that the last payout request was interrupted (possibly due to a power failure). The amounts of the value paid and requested are given in the event data.',
            name: 'INCOMPLETE_PAYOUT',
            actual: 1,
            requested: 5,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('INCOMPLETE_PAYOUT: protocol >= 6', () => {
      const data = [
        0xf0, 0xdc, 0x02, 0x01, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x55,
        0x41, 0x48,
      ]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 220,
            description:
              'The device has detected a discrepancy on power-up that the last payout request was interrupted (possibly due to a power failure). The amounts of the value paid and requested are given in the event data.',
            name: 'INCOMPLETE_PAYOUT',
            value: [
              {
                country_code: 'USD',
                actual: 1,
                requested: 5,
              },
              {
                country_code: 'UAH',
                actual: 2,
                requested: 7,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })
    // TODO nv11

    test('INCOMPLETE_FLOAT: protocol < 6', () => {
      const data = [0xf0, 0xdd, 0x01, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 221,
            description:
              'The device has detected a discrepancy on power-up that the last float request was interrupted (possibly due to a power failure). The amounts of the value paid and requested are given in the event data.',
            name: 'INCOMPLETE_FLOAT',
            actual: 1,
            requested: 5,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('INCOMPLETE_FLOAT: protocol >= 6', () => {
      const data = [
        0xf0, 0xdd, 0x02, 0x01, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x55,
        0x41, 0x48,
      ]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 221,
            description:
              'The device has detected a discrepancy on power-up that the last float request was interrupted (possibly due to a power failure). The amounts of the value paid and requested are given in the event data.',
            name: 'INCOMPLETE_FLOAT',
            value: [
              {
                country_code: 'USD',
                actual: 1,
                requested: 5,
              },
              {
                country_code: 'UAH',
                actual: 2,
                requested: 7,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('CASHBOX_PAID: protocol < 6', () => {
      const data = [0xf0, 0xde, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 222,
            description:
              'This is given at the end of a payout cycle. It shows the value of stored coins that were routed to the cashbox that were paid into the cashbox during the payout cycle.',
            name: 'CASHBOX_PAID',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('CASHBOX_PAID: protocol >= 6', () => {
      const data = [0xf0, 0xde, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 222,
            description:
              'This is given at the end of a payout cycle. It shows the value of stored coins that were routed to the cashbox that were paid into the cashbox during the payout cycle.',
            name: 'CASHBOX_PAID',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 2,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('COIN_CREDIT: protocol < 6', () => {
      const data = [0xf0, 0xdf, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 223,
            description:
              'A coin has been detected as added to the system via the attached coin mechanism. The value of the coin detected is given in the event data.',
            name: 'COIN_CREDIT',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('COIN_CREDIT: protocol >= 6', () => {
      const data = [0xf0, 0xdf, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 223,
            description:
              'A coin has been detected as added to the system via the attached coin mechanism. The value of the coin detected is given in the event data.',
            name: 'COIN_CREDIT',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 2,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('COIN_MECH_JAMMED', () => {
      const data = [0xf0, 0xc4]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 196,
            description: 'The attached coin mechanism has been detected as having a jam.',
            name: 'COIN_MECH_JAMMED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('COIN_MECH_RETURN_PRESSED', () => {
      const data = [0xf0, 0xc5]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 197,
            description: 'The attached coin mechanism has been detected as having is reject or return button pressed.',
            name: 'COIN_MECH_RETURN_PRESSED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('EMPTYING', () => {
      const data = [0xf0, 0xc2]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 194,
            description: 'The device is in the process of emptying its content to the system cashbox in response to an Empty command.',
            name: 'EMPTYING',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('EMPTIED', () => {
      const data = [0xf0, 0xc3]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 195,
            description: 'The device has completed its Empty process in response to an Empty command from the host.',
            name: 'EMPTIED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('SMART_EMPTYING: protocol < 6', () => {
      const data = [0xf0, 0xb3, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 179,
            description:
              'The device is in the process of carrying out its Smart Empty command from the host. The value emptied at the poll point is given in the event data.',
            name: 'SMART_EMPTYING',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('SMART_EMPTYING: protocol >= 6', () => {
      const data = [0xf0, 0xb3, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 179,
            description:
              'The device is in the process of carrying out its Smart Empty command from the host. The value emptied at the poll point is given in the event data.',
            name: 'SMART_EMPTYING',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 2,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('SMART_EMPTIED: protocol < 6', () => {
      const data = [0xf0, 0xb4, 0x01, 0x00, 0x00, 0x00]
      const result = parseData(data, 'POLL', 5, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 180,
            description: 'The device has completed its Smart Empty command. The total amount emptied is given in the event data.',
            name: 'SMART_EMPTIED',
            value: 1,
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('SMART_EMPTIED: protocol >= 6', () => {
      const data = [0xf0, 0xb4, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 180,
            description: 'The device has completed its Smart Empty command. The total amount emptied is given in the event data.',
            name: 'SMART_EMPTIED',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 2,
              },
            ],
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('COIN_MECH_ERROR', () => {
      const data = [0xf0, 0xb7]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 183,
            description: 'The attached coin mechanism has generated an error. Its code is given in the event data.',
            name: 'COIN_MECH_ERROR',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_STORED_IN_PAYOUT', () => {
      const data = [0xf0, 0xdb]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 219,
            description: 'The note has been passed into the note store of the payout unit.',
            name: 'NOTE_STORED_IN_PAYOUT',
          },
        ],
        status: 'OK',
        success: true,
      })
    })
    // TODO nv11

    test('PAYOUT_OUT_OF_SERVICE', () => {
      const data = [0xf0, 0xc6]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 198,
            description:
              'This event is given if the payout goes out of service during operation. If this event is detected after a poll, the host can send the ENABLE PAYOUT DEVICE command to determine if the payout unit comes back into service.',
            name: 'PAYOUT_OUT_OF_SERVICE',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('JAM_RECOVERY', () => {
      const data = [0xf0, 0xb0]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 176,
            description:
              'The SMART Payout unit is in the process of recovering from a detected jam. This process will typically move five notes to the cash box; this is done to minimise the possibility the unit will go out of service',
            name: 'JAM_RECOVERY',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('ERROR_DURING_PAYOUT: protocol < 6', () => {
      const data = [0xf0, 0xb1, 0x00]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 177,
            description:
              'Returned if an error is detected whilst moving a note inside the SMART Payout unit. The cause of error (1 byte) indicates the source of the condition; 0x00 for note not being correctly detected as it is routed to cashbox or for payout, 0x01 if note is jammed in transport. In the case of the incorrect detection, the response to Cashbox Payout Operation Data request would report the note expected to be paid out.',
            name: 'ERROR_DURING_PAYOUT',
            error: 'Note not being correctly detected as it is routed',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('ERROR_DURING_PAYOUT: protocol >= 6', () => {
      const data = [0xf0, 0xb1, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48, 0x00]
      const result = parseData(data, 'POLL', 7, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 177,
            description:
              'Returned if an error is detected whilst moving a note inside the SMART Payout unit. The cause of error (1 byte) indicates the source of the condition; 0x00 for note not being correctly detected as it is routed to cashbox or for payout, 0x01 if note is jammed in transport. In the case of the incorrect detection, the response to Cashbox Payout Operation Data request would report the note expected to be paid out.',
            name: 'ERROR_DURING_PAYOUT',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 2,
              },
            ],
            error: 'Note not being correctly detected as it is routed',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_TRANSFERED_TO_STACKER: protocol >=6', () => {
      const data = [0xf0, 0xc9, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 201,
            description: 'Reported when a note has been successfully moved from the payout store into the stacker cashbox.',
            name: 'NOTE_TRANSFERED_TO_STACKER',
            value: {
              country_code: 'USD',
              value: 1,
            },
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_HELD_IN_BEZEL: protocol >=8', () => {
      const data = [0xf0, 0xce, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44]
      const result = parseData(data, 'POLL', 8, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 206,
            description: 'Reported when a dispensing note is held in the bezel of the payout device.',
            name: 'NOTE_HELD_IN_BEZEL',
            value: {
              country_code: 'USD',
              value: 1,
            },
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_PAID_INTO_STORE_AT_POWER-UP: protocol < 8', () => {
      const data = [0xf0, 0xcb, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44]
      const result = parseData(data, 'POLL', 7, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 203,
            description: 'Reported when a note has been detected as paid into the payout store as part of the power-up procedure.',
            name: 'NOTE_PAID_INTO_STORE_AT_POWER-UP',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_PAID_INTO_STORE_AT_POWER-UP: protocol >=8', () => {
      const data = [0xf0, 0xcb, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44]
      const result = parseData(data, 'POLL', 8, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 203,
            description: 'Reported when a note has been detected as paid into the payout store as part of the power-up procedure.',
            name: 'NOTE_PAID_INTO_STORE_AT_POWER-UP',
            value: {
              country_code: 'USD',
              value: 1,
            },
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_PAID_INTO_STACKER_AT_POWER-UP: protocol >=8', () => {
      const data = [0xf0, 0xca, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44]
      const result = parseData(data, 'POLL', 8, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 202,
            description: 'Reported when a note has been detected as paid into the cashbox stacker as part of the power-up procedure.',
            name: 'NOTE_PAID_INTO_STACKER_AT_POWER-UP',
            value: {
              country_code: 'USD',
              value: 1,
            },
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_DISPENSED_AT_POWER-UP: protocol < 6', () => {
      const data = [0xf0, 0xcd, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44]
      const result = parseData(data, 'POLL', 4, 'Note Float fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 205,
            description: 'Reported when a note has been dispensed as part of the power-up procedure.',
            name: 'NOTE_DISPENSED_AT_POWER-UP',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_DISPENSED_AT_POWER-UP: protocol >=6', () => {
      const data = [0xf0, 0xcd, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44]
      const result = parseData(data, 'POLL', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 205,
            description: 'Reported when a note has been dispensed as part of the power-up procedure.',
            name: 'NOTE_DISPENSED_AT_POWER-UP',
            value: {
              country_code: 'USD',
              value: 1,
            },
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_FLOAT_REMOVED', () => {
      const data = [0xf0, 0xc7]
      const result = parseData(data, 'POLL', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 199,
            description: 'Reported when a note float unit has been detected as removed from its validator.',
            name: 'NOTE_FLOAT_REMOVED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('NOTE_FLOAT_ATTACHED', () => {
      const data = [0xf0, 0xc8]
      const result = parseData(data, 'POLL', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 200,
            description: 'Reported when a note float unit has been detected as removed from its validator.',
            name: 'NOTE_FLOAT_ATTACHED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('DEVICE_FULL', () => {
      const data = [0xf0, 0xcf]
      const result = parseData(data, 'POLL', 6, 'Note Float fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 207,
            description:
              'This event is reported when the Note Float has reached its limit of stored notes. This event will be reported until a note is paid out or stacked.',
            name: 'DEVICE_FULL',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('Skip unknown status', () => {
      const data = [0xf0, 0x00, 0x00, 0x00, 0xb6, 0x00]
      const result = parseData(data, 'POLL', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 182,
            description:
              'This event is given only when using the Poll with ACK command. It is given when the BNV is powered up and setting its sensors and mechanisms to be ready for Note acceptance. When the event response does not contain this event, the BNV is ready to be enabled and used.',
            name: 'INITIALISING',
          },
        ],
        status: 'OK',
        success: true,
      })
    })

    test('Multiple events', () => {
      const data = [
        0xf0, 0xb1, 0x02, 0x01, 0x00, 0x00, 0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48, 0x00, 0xb4, 0x02, 0x01, 0x00, 0x00,
        0x00, 0x55, 0x53, 0x44, 0x02, 0x00, 0x00, 0x00, 0x55, 0x41, 0x48, 0xe4,
      ]
      const result = parseData(data, 'POLL', 8, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'POLL',
        info: [
          {
            code: 177,
            description:
              'Returned if an error is detected whilst moving a note inside the SMART Payout unit. The cause of error (1 byte) indicates the source of the condition; 0x00 for note not being correctly detected as it is routed to cashbox or for payout, 0x01 if note is jammed in transport. In the case of the incorrect detection, the response to Cashbox Payout Operation Data request would report the note expected to be paid out.',
            name: 'ERROR_DURING_PAYOUT',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 2,
              },
            ],
            error: 'Note not being correctly detected as it is routed',
          },
          {
            code: 180,
            description: 'The device has completed its Smart Empty command. The total amount emptied is given in the event data.',
            name: 'SMART_EMPTIED',
            value: [
              {
                country_code: 'USD',
                value: 1,
              },
              {
                country_code: 'UAH',
                value: 2,
              },
            ],
          },
          {
            code: 228,
            description: 'A device with a detectable cashbox has detected that it has been replaced.',
            name: 'CASHBOX_REPLACED',
          },
        ],
        status: 'OK',
        success: true,
      })
    })
  })

  describe('HOST_PROTOCOL_VERSION', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'HOST_PROTOCOL_VERSION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'HOST_PROTOCOL_VERSION',
        info: {},
        status: 'OK',
        success: true,
      })
    })

    test('FAIL', () => {
      const data = [0xf8]
      const result = parseData(data, 'HOST_PROTOCOL_VERSION', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'HOST_PROTOCOL_VERSION',
        info: {},
        status: 'FAIL',
        success: false,
      })
    })
  })

  describe('SETUP_REQUEST', () => {
    test('OK: SMART Hopper, protocol < 6', () => {
      const data = [0xf0, 0x03, 0x30, 0x31, 0x30, 0x30, 0x45, 0x55, 0x52, 0x05, 0x03, 0x01, 0x00, 0x02, 0x00, 0x05, 0x00]
      const result = parseData(data, 'SETUP_REQUEST', 5, 'Smart Hopper')

      expect(result).toEqual({
        command: 'SETUP_REQUEST',
        info: {
          coin_values: [1, 2, 5],
          country_code: 'EUR',
          firmware_version: '1.00',
          number_of_coin_values: 3,
          protocol_version: 5,
          unit_type: 'Smart Hopper',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: SMART Hopper, protocol >= 6', () => {
      const data = [
        0xf0, 0x03, 0x30, 0x31, 0x30, 0x30, 0x45, 0x55, 0x52, 0x06, 0x03, 0x01, 0x00, 0x02, 0x00, 0x05, 0x00, 0x45, 0x55, 0x52, 0x45, 0x55, 0x52,
        0x45, 0x55, 0x52,
      ]
      const result = parseData(data, 'SETUP_REQUEST', 6, 'Smart Hopper')

      expect(result).toEqual({
        command: 'SETUP_REQUEST',
        info: {
          coin_values: [1, 2, 5],
          country_code: 'EUR',
          country_codes_for_values: ['EUR', 'EUR', 'EUR'],
          firmware_version: '1.00',
          number_of_coin_values: 3,
          protocol_version: 6,
          unit_type: 'Smart Hopper',
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: Banknote validator', () => {
      const data = [
        0xf0, 0x00, 0x30, 0x31, 0x30, 0x30, 0x45, 0x55, 0x52, 0x00, 0x00, 0x01, 0x03, 0x05, 0x0a, 0x14, 0x02, 0x02, 0x02, 0x00, 0x00, 0x64, 0x04,
      ]
      const result = parseData(data, 'SETUP_REQUEST', 4, 'Banknote validator')

      expect(result).toEqual({
        command: 'SETUP_REQUEST',
        info: {
          channel_security: [2, 2, 2],
          channel_value: [5, 10, 20],
          country_code: 'EUR',
          firmware_version: '1.00',
          number_of_channels: 3,
          protocol_version: 4,
          real_value_multiplier: 100,
          unit_type: 'Banknote validator',
          value_multiplier: 1,
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: protocol < 6', () => {
      const data = [
        0xf0, 0x06, 0x30, 0x34, 0x35, 0x39, 0x55, 0x53, 0x44, 0x00, 0x00, 0x01, 0x07, 0x01, 0x02, 0x05, 0x0a, 0x14, 0x32, 0x64, 0x02, 0x02, 0x02,
        0x02, 0x02, 0x02, 0x02, 0x00, 0x00, 0x64, 0x04,
      ]
      const result = parseData(data, 'SETUP_REQUEST', 4, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SETUP_REQUEST',
        info: {
          channel_security: [2, 2, 2, 2, 2, 2, 2],
          channel_value: [1, 2, 5, 10, 20, 50, 100],
          country_code: 'USD',
          firmware_version: '4.59',
          number_of_channels: 7,
          protocol_version: 4,
          real_value_multiplier: 100,
          unit_type: 'SMART payout fitted',
          value_multiplier: 1,
        },
        status: 'OK',
        success: true,
      })
    })

    test('OK: protocol >= 6', () => {
      const data = [
        0xf0, 0x06, 0x30, 0x34, 0x35, 0x39, 0x55, 0x53, 0x44, 0x00, 0x00, 0x01, 0x07, 0x01, 0x02, 0x05, 0x0a, 0x14, 0x32, 0x64, 0x02, 0x02, 0x02,
        0x02, 0x02, 0x02, 0x02, 0x00, 0x00, 0x64, 0x06, 0x55, 0x53, 0x44, 0x55, 0x53, 0x44, 0x55, 0x53, 0x44, 0x55, 0x53, 0x44, 0x55, 0x53, 0x44,
        0x55, 0x53, 0x44, 0x55, 0x53, 0x44, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x14,
        0x00, 0x00, 0x00, 0x32, 0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00,
      ]
      const result = parseData(data, 'SETUP_REQUEST', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SETUP_REQUEST',
        info: {
          channel_security: [2, 2, 2, 2, 2, 2, 2],
          channel_value: [1, 2, 5, 10, 20, 50, 100],
          country_code: 'USD',
          expanded_channel_country_code: ['USD', 'USD', 'USD', 'USD', 'USD', 'USD', 'USD'],
          expanded_channel_value: [1, 2, 5, 10, 20, 50, 100],
          firmware_version: '4.59',
          number_of_channels: 7,
          protocol_version: 6,
          real_value_multiplier: 100,
          unit_type: 'SMART payout fitted',
          value_multiplier: 1,
        },
        status: 'OK',
        success: true,
      })
    })
  })

  describe('DISPLAY_OFF', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'DISPLAY_OFF', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'DISPLAY_OFF',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('DISPLAY_ON', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'DISPLAY_ON', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'DISPLAY_ON',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('SET_CHANNEL_INHIBITS', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'SET_CHANNEL_INHIBITS', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'SET_CHANNEL_INHIBITS',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })

  describe('RESET', () => {
    test('OK', () => {
      const data = [0xf0]
      const result = parseData(data, 'RESET', 6, 'SMART payout fitted')

      expect(result).toEqual({
        command: 'RESET',
        info: {},
        status: 'OK',
        success: true,
      })
    })
  })
})
