const statusDesc = require('../../../static/status_desc.json')
const unitType = require('../../../static/unit_type.json')
const readBytesFromBuffer = require('../../readBytesFromBuffer')

function parsePoll(data, result, protocolVersion, deviceUnitType) {
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
}

module.exports = parsePoll
