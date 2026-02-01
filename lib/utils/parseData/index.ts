import { readBytesFromBuffer } from '../readBytesFromBuffer'
import { ParsedResult } from '../types'

import statusDesc from '../../static/status_desc.json'
import unitType from '../../static/unit_type.json'
import rejectNote from '../../static/reject_note.json'

interface StatusDescEntry {
  name: string
  description?: string
  devices?: string[]
  data?: Record<string, Record<string, string>>
}

interface RejectNoteEntry {
  name: string
  description: string
}

export function parseData(
  data: number[] | Buffer,
  currentCommand: string,
  protocolVersion: number | null,
  deviceUnitType: string | null,
): ParsedResult {
  const statusEntry = (statusDesc as Record<string, StatusDescEntry>)[data[0]]

  const result: ParsedResult = {
    success: data[0] === 0xf0,
    status: statusEntry !== undefined ? statusEntry.name : 'UNDEFINED',
    command: currentCommand,
    info: {},
  }

  if (result.success) {
    let buf = Buffer.from(data).subarray(1)

    if (currentCommand === 'REQUEST_KEY_EXCHANGE') {
      result.info.key = Array.from(buf)
    } else if (currentCommand === 'SETUP_REQUEST') {
      const unit_type = (unitType as Record<string, string>)[buf[0]]
      const firmware_version = (parseInt(readBytesFromBuffer(buf, 1, 4).toString()) / 100).toFixed(2)
      const country_code = readBytesFromBuffer(buf, 5, 3).toString()
      const isSmartHopper = buf[0] === 3

      if (isSmartHopper) {
        const protocol_version = buf.readUInt8(8)
        const number_of_coin_values = buf.readUInt8(9)
        const coin_values = Array.from({ length: number_of_coin_values }, (_, i) => buf.readUIntLE(10 + i * 2, 2))

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
            readBytesFromBuffer(buf, 10 + number_of_coin_values * 2 + i * 3, 3).toString(),
          )
          Object.assign(result.info, { country_codes_for_values })
        }
      } else {
        const n = buf.readUInt8(11)
        const value_multiplier = buf.readUIntBE(8, 3)

        Object.assign(result.info, {
          channel_security: Array.from(buf.slice(12 + n, 12 + n * 2)),
          channel_value: Array.from(readBytesFromBuffer(buf, 12, n).map(value => value * value_multiplier)),
          country_code,
          firmware_version,
          number_of_channels: n,
          protocol_version: buf.readUInt8(15 + n * 2),
          real_value_multiplier: buf.readUIntBE(12 + n * 2, 3),
          unit_type,
          value_multiplier,
        })

        if ((result.info.protocol_version as number) >= 6) {
          Object.assign(result.info, {
            expanded_channel_country_code: readBytesFromBuffer(buf, 16 + n * 2, n * 3)
              .toString()
              .match(/.{3}/g),
            expanded_channel_value: Array.from({ length: n }, (_, i) => readBytesFromBuffer(buf, 16 + n * 5, n * 4).readUInt32LE(i * 4)),
          })
        }
      }
    } else if (currentCommand === 'GET_SERIAL_NUMBER') {
      result.info.serial_number = Buffer.from(buf.slice(0, 4)).readUInt32BE()
    } else if (currentCommand === 'UNIT_DATA') {
      Object.assign(result.info, {
        unit_type: (unitType as Record<string, string>)[buf[0]],
        firmware_version: (parseInt(readBytesFromBuffer(buf, 1, 4).toString()) / 100).toFixed(2),
        country_code: readBytesFromBuffer(buf, 5, 3).toString(),
        value_multiplier: buf.readUIntBE(8, 3),
        protocol_version: buf.readUInt8(11),
      })
    } else if (currentCommand === 'CHANNEL_VALUE_REQUEST') {
      const count = buf[0]

      if (protocolVersion !== null && protocolVersion >= 6) {
        Object.assign(result.info, {
          channel: Array.from(buf.subarray(1, count + 1)),
          country_code: Array.from({ length: count }, (_, i) => readBytesFromBuffer(buf, count + 1 + i * 3, 3).toString()),
          value: Array.from({ length: count }, (_, i) => buf.readUIntLE(count + 1 + count * 3 + i * 4, 4)),
        })
      } else {
        result.info.channel = Array.from(buf.subarray(1, count + 1))
      }
    } else if (currentCommand === 'CHANNEL_SECURITY_DATA') {
      const level: Record<number, string> = {
        0: 'not_implemented',
        1: 'low',
        2: 'std',
        3: 'high',
        4: 'inhibited',
      }
      const channel: Record<number, string> = {}
      for (let i = 1; i <= buf[0]; i++) {
        channel[i] = level[buf[i]]
      }
      result.info.channel = channel
    } else if (currentCommand === 'CHANNEL_RE_TEACH_DATA') {
      result.info.source = Array.from(buf)
    } else if (currentCommand === 'LAST_REJECT_CODE') {
      const entry = (rejectNote as Record<string, RejectNoteEntry>)[buf[0]]
      result.info.code = buf[0]
      result.info.name = entry.name
      result.info.description = entry.description
    } else if (currentCommand === 'GET_FIRMWARE_VERSION' || currentCommand === 'GET_DATASET_VERSION') {
      result.info.version = Buffer.from(buf).toString()
    } else if (currentCommand === 'GET_ALL_LEVELS') {
      const counter: Record<number, unknown> = {}
      for (let i = 0; i < buf[0]; i++) {
        const tmp = buf.slice(i * 9 + 1, i * 9 + 10)
        counter[i + 1] = {
          denomination_level: Buffer.from(tmp.slice(0, 2)).readUInt16LE(),
          value: Buffer.from(tmp.slice(2, 6)).readUInt32LE(),
          country_code: Buffer.from(tmp.slice(6, 9)).toString(),
        }
      }
      result.info.counter = counter
    } else if (currentCommand === 'GET_BAR_CODE_READER_CONFIGURATION') {
      const status: Record<number, Record<number, string>> = {
        0: { 0: 'none', 1: 'Top reader fitted', 2: 'Bottom reader fitted', 3: 'both fitted' },
        1: { 0: 'none', 1: 'top', 2: 'bottom', 3: 'both' },
        2: { 1: 'Interleaved 2 of 5' },
      }
      result.info = {
        bar_code_hardware_status: status[0][buf[0]],
        readers_enabled: status[1][buf[1]],
        bar_code_format: status[2][buf[2]],
        number_of_characters: buf[3],
      }
    } else if (currentCommand === 'GET_BAR_CODE_INHIBIT_STATUS') {
      result.info.currency_read_enable = buf[0].toString(2).slice(7, 8) === '0'
      result.info.bar_code_enable = buf[0].toString(2).slice(6, 7) === '0'
    } else if (currentCommand === 'GET_BAR_CODE_DATA') {
      const status: Record<number, string> = { 0: 'no_valid_data', 1: 'ticket_in_escrow', 2: 'ticket_stacked', 3: 'ticket_rejected' }
      result.info.status = status[buf[0]]
      result.info.data = Buffer.from(buf.slice(2, buf[1] + 2)).toString()
    } else if (currentCommand === 'GET_DENOMINATION_LEVEL') {
      result.info.level = Buffer.from(buf).readUInt16LE()
    } else if (currentCommand === 'GET_DENOMINATION_ROUTE') {
      const res: Record<number, { code: number; value: string }> = {
        0: { code: 0, value: 'Recycled and used for payouts' },
        1: { code: 1, value: 'Detected denomination is routed to system cashbox' },
      }
      result.info = res[buf[0]]
    } else if (currentCommand === 'GET_MINIMUM_PAYOUT') {
      result.info.value = Buffer.from(buf).readUInt32LE()
    } else if (currentCommand === 'GET_NOTE_POSITIONS') {
      const count = buf[0]
      buf = buf.slice(1)
      const slot: Record<number, unknown> = {}

      if (buf.length === count) {
        for (let i = 0; i < count; i++) {
          slot[i + 1] = { channel: buf[i] }
        }
      } else {
        for (let i = 0; i < count; i++) {
          slot[i + 1] = { value: buf.readUInt32LE(i * 4) }
        }
      }
      result.info.slot = slot
    } else if (currentCommand === 'GET_BUILD_REVISION') {
      const count = buf.length / 3
      const device: Record<number, unknown> = {}
      for (let i = 0; i < count; i++) {
        device[i] = {
          unitType: (unitType as Record<string, string>)[buf[i * 3]],
          revision: Buffer.from(buf.slice(i * 3 + 1, i * 3 + 3)).readUInt16LE(),
        }
      }
      result.info.device = device
    } else if (currentCommand === 'GET_COUNTERS') {
      result.info.stacked = Buffer.from(buf.slice(1, 5)).readUInt32LE()
      result.info.stored = Buffer.from(buf.slice(5, 9)).readUInt32LE()
      result.info.dispensed = Buffer.from(buf.slice(9, 13)).readUInt32LE()
      result.info.transferred_from_store_to_stacker = Buffer.from(buf.slice(13, 17)).readUInt32LE()
      result.info.rejected = Buffer.from(buf.slice(17, 21)).readUInt32LE()
    } else if (currentCommand === 'GET_HOPPER_OPTIONS') {
      const value = buf.readUInt16LE(0)

      Object.assign(result.info, {
        payMode: (value & 0x01) !== 0,
        levelCheck: (value & 0x02) !== 0,
        motorSpeed: (value & 0x04) !== 0,
        cashBoxPayAcive: (value & 0x08) !== 0,
      })
    } else if (currentCommand === 'POLL' || currentCommand === 'POLL_WITH_ACK') {
      buf = Buffer.from(buf)
      const infoArr: Record<string, unknown>[] = []

      let k = 0
      while (k < buf.length) {
        const code = buf[k]
        const statusEntry2 = (statusDesc as Record<string, StatusDescEntry>)[code]

        if (!statusEntry2) {
          k += 1
          continue
        }

        const info: Record<string, unknown> = {
          code,
          name: statusEntry2?.name,
          description: statusEntry2?.description,
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
            info.channel = buf.readUInt8(k + 1)
            k += 2
            break

          case 'FRAUD_ATTEMPT': {
            const smartDevice = [(unitType as Record<string, string>)['3'], (unitType as Record<string, string>)['6']].includes(deviceUnitType!)

            if (protocolVersion !== null && protocolVersion >= 6 && smartDevice) {
              const length = buf[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                value: buf.readUInt32LE(k + 2 + i * 7),
                country_code: readBytesFromBuffer(buf, k + 6 + i * 7, 3).toString(),
              }))

              k += 2 + length * 7
            } else if (smartDevice) {
              info.value = buf.readUInt32LE(k + 1)
              k += 5
            } else {
              info.channel = buf.readUInt8(k + 1)
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
            if (protocolVersion !== null && protocolVersion >= 6) {
              const length = buf[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                value: buf.readUInt32LE(k + 2 + i * 7),
                country_code: readBytesFromBuffer(buf, k + 6 + i * 7, 3).toString(),
              }))

              k += 2 + length * 7
            } else {
              info.value = buf.readUInt32LE(k + 1)
              k += 5
            }
            break

          case 'INCOMPLETE_PAYOUT':
          case 'INCOMPLETE_FLOAT':
            if (protocolVersion !== null && protocolVersion >= 6) {
              const length = buf[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                actual: buf.readUInt32LE(k + 2 + i * 11),
                requested: buf.readUInt32LE(k + 6 + i * 11),
                country_code: readBytesFromBuffer(buf, k + 10 + i * 11, 3).toString(),
              }))

              k += 2 + length * 11
            } else {
              info.actual = buf.readUInt32LE(k + 1)
              info.requested = buf.readUInt32LE(k + 5)
              k += 9
            }
            break

          case 'ERROR_DURING_PAYOUT': {
            const errors: Record<number, string> = {
              0x00: 'Note not being correctly detected as it is routed',
              0x01: 'Note jammed in transport',
            }

            if (protocolVersion !== null && protocolVersion >= 7) {
              const length = buf[k + 1]
              info.value = Array.from({ length }, (_, i) => ({
                value: buf.readUInt32LE(k + 2 + i * 7),
                country_code: readBytesFromBuffer(buf, k + 6 + i * 7, 3).toString(),
              }))

              info.error = errors[buf.readUInt8(k + 2 + length * 7)]

              k += 3 + length * 7
            } else {
              info.error = errors[buf.readUInt8(k + 1)]
              k += 2
            }
            break
          }

          case 'NOTE_TRANSFERED_TO_STACKER':
          case 'NOTE_DISPENSED_AT_POWER-UP': {
            if (protocolVersion !== null && protocolVersion >= 6) {
              info.value = {
                value: buf.readUInt32LE(k + 1),
                country_code: readBytesFromBuffer(buf, k + 5, 3).toString(),
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
            if (protocolVersion !== null && protocolVersion >= 8) {
              info.value = {
                value: buf.readUInt32LE(k + 1),
                country_code: readBytesFromBuffer(buf, k + 5, 3).toString(),
              }

              k += 8
            } else {
              k += 1
            }
            break
        }

        infoArr.push(info)
      }
      result.info = infoArr as unknown as Record<string, unknown>
    } else if (currentCommand === 'CASHBOX_PAYOUT_OPERATION_DATA') {
      const dataArr: Record<string, unknown>[] = []
      for (let i = 0; i < buf[0]; i++) {
        dataArr[i] = {
          quantity: Buffer.from(buf.slice(i * 9 + 1, i * 9 + 3)).readUInt16LE(),
          value: Buffer.from(buf.slice(i * 9 + 3, i * 9 + 7)).readUInt32LE(),
          country_code: Buffer.from(buf.slice(i * 9 + 7, i * 9 + 10)).toString(),
        }
      }
      result.info = { data: dataArr }
    } else if (currentCommand === 'SET_REFILL_MODE' && buf.length === 1) {
      result.info = {
        enabled: buf[0] === 0x01,
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
