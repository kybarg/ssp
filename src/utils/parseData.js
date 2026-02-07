const statusDesc = require('../static/status_desc.json')
const unitType = require('../static/unit_type.json')
const rejectNote = require('../static/reject_note.json')
const readBytesFromBuffer = require('./readBytesFromBuffer')

function parseData(data, currentCommand, protocolVersion, deviceUnitType) {
  const result = {
    success: data[0] === 0xf0,
    status: statusDesc[data[0]] !== undefined ? statusDesc[data[0]].name : 'UNDEFINED',
    command: currentCommand,
    info: {},
  }

  if (result.success) {
    data = Buffer.from(data).subarray(1)

    if (currentCommand === 'REQUEST_KEY_EXCHANGE') {
      result.info.key = Array.from(data)
    } else if (currentCommand === 'SETUP_REQUEST') {
      // Common for all device types
      const unit_type = unitType[data[0]]
      const firmware_version = (parseInt(readBytesFromBuffer(data, 1, 4).toString()) / 100).toFixed(2)
      const country_code = readBytesFromBuffer(data, 5, 3).toString()
      const isSmartHopper = data[0] === 3

      if (isSmartHopper) {
        // Smart Hopper specific
        const protocol_version = data.readUInt8(8)
        const number_of_coin_values = data.readUInt8(9)
        const coin_values = Array.from({ length: number_of_coin_values }, (_, i) => data.readUIntLE(10 + i * 2, 2))

        Object.assign(result.info, {
          unit_type,
          firmware_version,
          country_code,
          protocol_version,
          number_of_coin_values,
          coin_values,
        })

        if (protocol_version >= 6) {
          const country_codes_for_values = Array.from({ length: number_of_coin_values }, (_, i) =>
            readBytesFromBuffer(data, 10 + number_of_coin_values * 2 + i * 3, 3).toString(),
          )
          Object.assign(result.info, { country_codes_for_values })
        }
      } else {
        // Other devices
        const n = data.readUInt8(11)
        const value_multiplier = data.readUIntBE(8, 3)

        Object.assign(result.info, {
          channel_security: Array.from(data.slice(12 + n, 12 + n * 2)),
          channel_value: Array.from(readBytesFromBuffer(data, 12, n).map(value => value * value_multiplier)),
          country_code,
          firmware_version,
          number_of_channels: n,
          protocol_version: data.readUInt8(15 + n * 2),
          real_value_multiplier: data.readUIntBE(12 + n * 2, 3),
          unit_type,
          value_multiplier,
        })

        if (result.info.protocol_version >= 6) {
          Object.assign(result.info, {
            expanded_channel_country_code: readBytesFromBuffer(data, 16 + n * 2, n * 3)
              .toString()
              .match(/.{3}/g),
            expanded_channel_value: Array.from({ length: n }, (_, i) => readBytesFromBuffer(data, 16 + n * 5, n * 4).readUInt32LE(i * 4)),
          })
        }
      }
    } else if (currentCommand === 'GET_SERIAL_NUMBER') {
      result.info.serial_number = Buffer.from(data.slice(0, 4)).readUInt32BE()
    } else if (currentCommand === 'UNIT_DATA') {
      Object.assign(result.info, {
        unit_type: unitType[data[0]],
        firmware_version: (parseInt(readBytesFromBuffer(data, 1, 4).toString()) / 100).toFixed(2),
        country_code: readBytesFromBuffer(data, 5, 3).toString(),
        value_multiplier: data.readUIntBE(8, 3),
        protocol_version: data.readUInt8(11),
      })
    } else if (currentCommand === 'CHANNEL_VALUE_REQUEST') {
      const count = data[0]

      if (protocolVersion >= 6) {
        Object.assign(result.info, {
          channel: Array.from(data.subarray(1, count + 1)),
          country_code: Array.from({ length: count }, (_, i) => readBytesFromBuffer(data, count + 1 + i * 3, 3).toString()),
          value: Array.from({ length: count }, (_, i) => data.readUIntLE(count + 1 + count * 3 + i * 4, 4)),
        })
      } else {
        result.info.channel = Array.from(data.subarray(1, count + 1))
      }
    } else if (currentCommand === 'CHANNEL_SECURITY_DATA') {
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
    } else if (currentCommand === 'CHANNEL_RE_TEACH_DATA') {
      result.info.source = Array.from(data)
    } else if (currentCommand === 'LAST_REJECT_CODE') {
      result.info.code = data[0]
      result.info.name = rejectNote[data[0]].name
      result.info.description = rejectNote[data[0]].description
    } else if (currentCommand === 'GET_FIRMWARE_VERSION' || currentCommand === 'GET_DATASET_VERSION') {
      result.info.version = Buffer.from(data).toString()
    } else if (currentCommand === 'GET_ALL_LEVELS') {
      result.info.counter = {}
      for (let i = 0; i < data[0]; i++) {
        const tmp = data.slice(i * 9 + 1, i * 9 + 10)
        result.info.counter[i + 1] = {
          denomination_level: Buffer.from(tmp.slice(0, 2)).readUInt16LE(),
          value: Buffer.from(tmp.slice(2, 6)).readUInt32LE(),
          country_code: Buffer.from(tmp.slice(6, 9)).toString(),
        }
      }
    } else if (currentCommand === 'GET_BAR_CODE_READER_CONFIGURATION') {
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
    } else if (currentCommand === 'GET_BAR_CODE_INHIBIT_STATUS') {
      result.info.currency_read_enable = data[0].toString(2).slice(7, 8) === '0'
      result.info.bar_code_enable = data[0].toString(2).slice(6, 7) === '0'
    } else if (currentCommand === 'GET_BAR_CODE_DATA') {
      const status = { 0: 'no_valid_data', 1: 'ticket_in_escrow', 2: 'ticket_stacked', 3: 'ticket_rejected' }
      result.info.status = status[data[0]]
      result.info.data = Buffer.from(data.slice(2, data[1] + 2)).toString()
    } else if (currentCommand === 'GET_DENOMINATION_LEVEL') {
      result.info.level = Buffer.from(data).readUInt16LE()
    } else if (currentCommand === 'GET_DENOMINATION_ROUTE') {
      const res = {
        0: { code: 0, value: 'Recycled and used for payouts' },
        1: { code: 1, value: 'Detected denomination is routed to system cashbox' },
      }
      result.info = res[data[0]]
    } else if (currentCommand === 'GET_MINIMUM_PAYOUT') {
      result.info.value = Buffer.from(data).readUInt32LE()
    } else if (currentCommand === 'GET_NOTE_POSITIONS') {
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
    } else if (currentCommand === 'GET_BUILD_REVISION') {
      const count = data.length / 3
      result.info.device = {}
      for (let i = 0; i < count; i++) {
        result.info.device[i] = {
          unitType: unitType[data[i * 3]],
          revision: Buffer.from(data.slice(i * 3 + 1, i * 3 + 3)).readUInt16LE(),
        }
      }
    } else if (currentCommand === 'GET_COUNTERS') {
      result.info.stacked = Buffer.from(data.slice(1, 5)).readUInt32LE()
      result.info.stored = Buffer.from(data.slice(5, 9)).readUInt32LE()
      result.info.dispensed = Buffer.from(data.slice(9, 13)).readUInt32LE()
      result.info.transferred_from_store_to_stacker = Buffer.from(data.slice(13, 17)).readUInt32LE()
      result.info.rejected = Buffer.from(data.slice(17, 21)).readUInt32LE()
    } else if (currentCommand === 'GET_HOPPER_OPTIONS') {
      const value = data.readUInt16LE(0)

      Object.assign(result.info, {
        payMode: (value & 0x01) !== 0,
        levelCheck: (value & 0x02) !== 0,
        motorSpeed: (value & 0x04) !== 0,
        cashBoxPayAcive: (value & 0x08) !== 0,
      })
    } else if (currentCommand === 'POLL' || currentCommand === 'POLL_WITH_ACK') {
      data = Buffer.from(data)
      result.info = []

      let k = 0
      while (k < data.length) {
        const code = data[k]

        if (!statusDesc[code]) {
          k += 1
          continue
        }

        const info = {
          code,
          name: statusDesc[code]?.name,
          description: statusDesc[code]?.description,
        }

        switch (info.name) {
          case 'SLAVE_RESET':
          case 'NOTE_REJECTING':
          case 'NOTE_REJECTED':
          case 'NOTE_STACKING':
          case 'NOTE_STACKED':
          case 'SAFE_NOTE_JAM':
          case 'UNSAFE_NOTE_JAM':
          case 'DISABLED':
          case 'STACKER_FULL':
          case 'CASHBOX_REMOVED':
          case 'CASHBOX_REPLACED':
          case 'BAR_CODE_TICKET_VALIDATED':
          case 'BAR_CODE_TICKET_ACKNOWLEDGE':
          case 'NOTE_PATH_OPEN':
          case 'CHANNEL_DISABLE':
          case 'INITIALISING':
          case 'COIN_MECH_JAMMED':
          case 'COIN_MECH_RETURN_PRESSED':
          case 'EMPTYING':
          case 'EMPTIED':
          case 'COIN_MECH_ERROR':
          case 'NOTE_STORED_IN_PAYOUT':
          case 'PAYOUT_OUT_OF_SERVICE':
          case 'JAM_RECOVERY':
          case 'NOTE_FLOAT_REMOVED':
          case 'NOTE_FLOAT_ATTACHED':
          case 'DEVICE_FULL':
            k += 1
            break

          case 'READ_NOTE':
          case 'CREDIT_NOTE':
          case 'NOTE_CLEARED_FROM_FRONT':
          case 'NOTE_CLEARED_TO_CASHBOX':
            info.channel = data.readUInt8(k + 1)
            k += 2
            break

          case 'FRAUD_ATTEMPT': {
            const smartDevice = [unitType[3], unitType[6]].includes(deviceUnitType)

            if (protocolVersion >= 6 && smartDevice) {
              const length = data[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                value: data.readUInt32LE(k + 2 + i * 7),
                country_code: readBytesFromBuffer(data, k + 6 + i * 7, 3).toString(),
              }))

              k += 2 + length * 7
            } else if (smartDevice) {
              info.value = data.readUInt32LE(k + 1)
              k += 5
            } else {
              info.channel = data.readUInt8(k + 1)
              k += 2
            }
            break
          }

          case 'DISPENSING':
          case 'DISPENSED':
          case 'JAMMED':
          case 'HALTED':
          case 'FLOATING':
          case 'FLOATED':
          case 'TIME_OUT':
          case 'CASHBOX_PAID':
          case 'COIN_CREDIT':
          case 'SMART_EMPTYING':
          case 'SMART_EMPTIED':
            if (protocolVersion >= 6) {
              const length = data[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                value: data.readUInt32LE(k + 2 + i * 7),
                country_code: readBytesFromBuffer(data, k + 6 + i * 7, 3).toString(),
              }))

              k += 2 + length * 7
            } else {
              info.value = data.readUInt32LE(k + 1)
              k += 5
            }
            break

          case 'INCOMPLETE_PAYOUT':
          case 'INCOMPLETE_FLOAT':
            if (protocolVersion >= 6) {
              const length = data[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                actual: data.readUInt32LE(k + 2 + i * 11),
                requested: data.readUInt32LE(k + 6 + i * 11),
                country_code: readBytesFromBuffer(data, k + 10 + i * 11, 3).toString(),
              }))

              k += 2 + length * 11
            } else {
              info.actual = data.readUInt32LE(k + 1)
              info.requested = data.readUInt32LE(k + 5)
              k += 9
            }
            break

          case 'ERROR_DURING_PAYOUT': {
            const errors = {
              0x00: 'Note not being correctly detected as it is routed',
              0x01: 'Note jammed in transport',
            }

            if (protocolVersion >= 7) {
              const length = data[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                value: data.readUInt32LE(k + 2 + i * 7),
                country_code: readBytesFromBuffer(data, k + 6 + i * 7, 3).toString(),
              }))

              info.error = errors[data.readUInt8(k + 2 + length * 7)]

              k += 3 + length * 7
            } else {
              info.error = errors[data.readUInt8(k + 1)]
              k += 2
            }
            break
          }

          case 'NOTE_TRANSFERED_TO_STACKER':
          case 'NOTE_DISPENSED_AT_POWER-UP': {
            if (protocolVersion >= 6) {
              info.value = {
                value: data.readUInt32LE(k + 1),
                country_code: readBytesFromBuffer(data, k + 5, 3).toString(),
              }

              k += 8
            } else {
              k += 1
            }
            break
          }

          case 'NOTE_HELD_IN_BEZEL':
          case 'NOTE_PAID_INTO_STACKER_AT_POWER-UP':
          case 'NOTE_PAID_INTO_STORE_AT_POWER-UP':
            if (protocolVersion >= 8) {
              info.value = {
                value: data.readUInt32LE(k + 1),
                country_code: readBytesFromBuffer(data, k + 5, 3).toString(),
              }

              k += 8
            } else {
              k += 1
            }
            break
        }

        result.info.push(info)
      }
    } else if (currentCommand === 'CASHBOX_PAYOUT_OPERATION_DATA') {
      result.info = { data: [] }
      for (let i = 0; i < data[0]; i++) {
        result.info.data[i] = {
          quantity: Buffer.from(data.slice(i * 9 + 1, i * 9 + 3)).readUInt16LE(),
          value: Buffer.from(data.slice(i * 9 + 3, i * 9 + 7)).readUInt32LE(),
          country_code: Buffer.from(data.slice(i * 9 + 7, i * 9 + 10)).toString(),
        }
      }
    } else if (currentCommand === 'SET_REFILL_MODE' && data.length === 1) {
      result.info = {
        enabled: data[0] === 0x01,
      }
    }
  } else {
    if (result.status === 'COMMAND_CANNOT_BE_PROCESSED' && currentCommand === 'ENABLE_PAYOUT_DEVICE') {
      result.info.errorCode = data[1]
      switch (data[1]) {
        case 1:
          result.info.error = 'No device connected'
          break
        case 2:
          result.info.error = 'Invalid currency detected'
          break
        case 3:
          result.info.error = 'Device busy'
          break
        case 4:
          result.info.error = 'Empty only (Note float only)'
          break
        case 5:
          result.info.error = 'Device error'
          break
        default:
          result.info.error = 'Unknown error'
          break
      }
    } else if (
      result.status === 'COMMAND_CANNOT_BE_PROCESSED' &&
      (currentCommand === 'PAYOUT_BY_DENOMINATION' || currentCommand === 'FLOAT_AMOUNT' || currentCommand === 'PAYOUT_AMOUNT')
    ) {
      result.info.errorCode = data[1]
      switch (data[1]) {
        case 0:
          result.info.error = 'Not enough value in device'
          break
        case 1:
          result.info.error = 'Cannot pay exact amount'
          break
        case 3:
          result.info.error = 'Device busy'
          break
        case 4:
          result.info.error = 'Device disabled'
          break
        default:
          result.info.error = 'Unknown error'
          break
      }
    } else if (
      result.status === 'COMMAND_CANNOT_BE_PROCESSED' &&
      (currentCommand === 'SET_VALUE_REPORTING_TYPE' || currentCommand === 'GET_DENOMINATION_ROUTE' || currentCommand === 'SET_DENOMINATION_ROUTE')
    ) {
      result.info.errorCode = data[1]
      switch (data[1]) {
        case 1:
          result.info.error = 'No payout connected'
          break
        case 2:
          result.info.error = 'Invalid currency detected'
          break
        case 3:
          result.info.error = 'Payout device error'
          break
        default:
          result.info.error = 'Unknown error'
          break
      }
    } else if (result.status === 'COMMAND_CANNOT_BE_PROCESSED' && currentCommand === 'FLOAT_BY_DENOMINATION') {
      result.info.errorCode = data[1]
      switch (data[1]) {
        case 0:
          result.info.error = 'Not enough value in device'
          break
        case 1:
          result.info.error = 'Cannot pay exact amount'
          break
        case 3:
          result.info.error = 'Device busy'
          break
        case 4:
          result.info.error = 'Device disabled'
          break
        default:
          result.info.error = 'Unknown error'
          break
      }
    } else if (result.status === 'COMMAND_CANNOT_BE_PROCESSED' && (currentCommand === 'STACK_NOTE' || currentCommand === 'PAYOUT_NOTE')) {
      result.info.errorCode = data[1]
      switch (data[1]) {
        case 1:
          result.info.error = 'Note float unit not connected'
          break
        case 2:
          result.info.error = 'Note float empty'
          break
        case 3:
          result.info.error = 'Note float busy'
          break
        case 4:
          result.info.error = 'Note float disabled'
          break
        default:
          result.info.error = 'Unknown error'
          break
      }
    } else if (result.status === 'COMMAND_CANNOT_BE_PROCESSED' && currentCommand === 'GET_NOTE_POSITIONS') {
      result.info.errorCode = data[1]
      if (data[1] === 2) {
        result.info.error = 'Invalid currency'
      }
    }
  }

  return result
}

module.exports = parseData
