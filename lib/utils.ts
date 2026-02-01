import crypto from 'node:crypto'
import { satisfies } from 'semver'
import chalk from 'chalk'
import debug from 'debug'

const log = debug('ssp')

import statusDesc from './static/status_desc.json'
import unitType from './static/unit_type.json'
import rejectNote from './static/reject_note.json'
import commandList from './static/commands.json'
import { engines } from '../package.json'

const STX = 0x7f
const STEX = 0x7e

// ---------------------------------------------------------------------------
// JSON shape types
// ---------------------------------------------------------------------------

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

interface CommandArgsDef {
  [key: string]: string
}

interface CommandEntry {
  code: number
  encrypted: boolean
  args: false | CommandArgsDef
  device?: string[]
  description?: string
  example?: string
}

// ---------------------------------------------------------------------------
// Public types (exported for use by lib/index.ts and consumers)
// ---------------------------------------------------------------------------

export interface SSPKeys {
  encryptKey: Buffer | null
  fixedKey: string
  generator: bigint | null
  hostInter: bigint | null
  hostRandom: bigint | null
  key: bigint | null
  modulus: bigint | null
  slaveInterKey: bigint | null
}

export interface GeneratedKeys {
  generator: bigint
  modulus: bigint
  hostRandom: bigint
  hostInter: bigint
}

export interface EncryptionKeyResult {
  slaveInterKey: bigint
  key: bigint
  encryptKey: Buffer
}

export interface ParsedResult {
  success: boolean
  status: string
  command: string
  info: Record<string, unknown>
}

export interface ExtractedPacketData {
  success: boolean
  data: Buffer
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

export const absBigInt = (n: bigint): bigint => (n < 0n ? -n : n)

export function encrypt(key: Buffer, data: Buffer): Buffer {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  const cipher = crypto.createCipheriv('aes-128-ecb', key, null)
  cipher.setAutoPadding(false)
  return Buffer.concat([cipher.update(data), cipher.final()])
}

export function decrypt(key: Buffer, data: Buffer): Buffer {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  const decipher = crypto.createDecipheriv('aes-128-ecb', key, null)
  decipher.setAutoPadding(false)
  return Buffer.concat([decipher.update(data), decipher.final()])
}

export function readBytesFromBuffer(buffer: Buffer, startIndex: number, length: number): Buffer {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer object')
  }

  if (startIndex < 0 || startIndex >= buffer.length) {
    throw new Error('Invalid start index')
  }

  if (length < 0 || startIndex + length > buffer.length) {
    throw new Error('Invalid length or exceeds buffer size')
  }

  return buffer.subarray(startIndex, startIndex + length)
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

export function CRC16(source: number[] | Buffer): Buffer {
  const CRC_SSP_SEED = 0xffff
  const CRC_SSP_POLY = 0x8005
  let crc = CRC_SSP_SEED

  for (let i = 0; i < source.length; ++i) {
    crc ^= source[i] << 8
    for (let j = 0; j < 8; ++j) {
      crc = crc & 0x8000 ? (crc << 1) ^ CRC_SSP_POLY : crc << 1
    }
  }

  crc &= 0xffff

  const crcBuffer = Buffer.alloc(2)
  crcBuffer.writeUInt16LE(crc, 0)
  return crcBuffer
}

export function uInt64LE(number: bigint | number): Buffer {
  if (!Number.isInteger(Number(number)) || number < 0 || number > 18446744073709551615n) {
    throw new Error('Input must be an unsigned 64-bit integer')
  }

  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64LE(BigInt(number))
  return buffer
}

export function uInt32LE(number: number): Buffer {
  if (!Number.isInteger(number) || number < 0 || number > 4294967295) {
    throw new Error('Input must be an unsigned 32-bit integer')
  }

  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(number)
  return buffer
}

export function uInt16LE(number: number): Buffer {
  if (!Number.isInteger(number) || number < 0 || number > 65535) {
    throw new Error('Input must be an unsigned 16-bit integer')
  }

  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(number)
  return buffer
}

// ---------------------------------------------------------------------------
// argsToByte
// ---------------------------------------------------------------------------

interface DenominationRouteArgs {
  route: string
  value: number
  country_code?: string
  isHopper?: boolean
}

interface SetChannelInhibitsArgs {
  channels: number[]
}

interface SetCoinMechGlobalInhibitArgs {
  enable: boolean
}

interface SetHopperOptionsArgs {
  payMode?: number | boolean
  levelCheck?: boolean
  motorSpeed?: number | boolean
  cashBoxPayActive?: boolean
}

interface SetDenominationLevelArgs {
  value: number
  denomination: number
  country_code?: string
}

interface SetRefillModeArgs {
  mode: 'on' | 'off' | 'get'
}

interface HostProtocolVersionArgs {
  version: number
}

interface BarCodeConfigArgs {
  enable?: string
  numChar?: number
}

interface BarCodeInhibitArgs {
  currencyRead?: boolean
  barCode?: boolean
}

interface PayoutAmountArgs {
  amount: number
  country_code?: string
  test?: boolean
}

interface GetDenominationLevelArgs {
  amount: number
  country_code?: string
}

interface FloatAmountArgs {
  min_possible_payout: number
  amount: number
  country_code?: string
  test?: boolean
}

interface CoinMechInhibitsArgs {
  inhibited: boolean
  amount: number
  country_code?: string
}

interface DenominationValueEntry {
  number: number
  denomination: number
  country_code: string
}

interface PayoutByDenominationArgs {
  value: DenominationValueEntry[]
  test?: boolean
}

interface SetValueReportingTypeArgs {
  reportBy: string
}

interface SetBaudRateArgs {
  baudrate: number
  reset_to_default_on_reset: boolean
}

interface ConfigureBezelArgs {
  RGB: string
  volatile: boolean
}

interface EnablePayoutDeviceArgs {
  GIVE_VALUE_ON_STORED?: boolean
  REQUIRE_FULL_STARTUP?: boolean
  NO_HOLD_NOTE_ON_PAYOUT?: boolean
  OPTIMISE_FOR_PAYIN_SPEED?: boolean
}

interface SetFixedEncryptionKeyArgs {
  fixedKey: string
}

interface CoinMechOptionsArgs {
  ccTalk: boolean
}

interface KeyExchangeArgs {
  key: bigint | number
}

type CommandArgs =
  | KeyExchangeArgs
  | DenominationRouteArgs
  | SetChannelInhibitsArgs
  | SetCoinMechGlobalInhibitArgs
  | SetHopperOptionsArgs
  | SetDenominationLevelArgs
  | SetRefillModeArgs
  | HostProtocolVersionArgs
  | BarCodeConfigArgs
  | BarCodeInhibitArgs
  | PayoutAmountArgs
  | GetDenominationLevelArgs
  | FloatAmountArgs
  | CoinMechInhibitsArgs
  | PayoutByDenominationArgs
  | SetValueReportingTypeArgs
  | SetBaudRateArgs
  | ConfigureBezelArgs
  | EnablePayoutDeviceArgs
  | SetFixedEncryptionKeyArgs
  | CoinMechOptionsArgs

export function argsToByte(command: string, args: CommandArgs | undefined, protocolVersion: number | null): Buffer {
  if (args !== undefined) {
    switch (command) {
      case 'SET_GENERATOR':
      case 'SET_MODULUS':
      case 'REQUEST_KEY_EXCHANGE':
        return uInt64LE((args as KeyExchangeArgs).key)
      case 'SET_DENOMINATION_ROUTE': {
        const a = args as DenominationRouteArgs
        const routeBuffer = Buffer.from([a.route === 'payout' ? 0 : 1])
        const valueBuffer32 = uInt32LE(a.value)

        if (protocolVersion !== null && protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(a.country_code!, 'ascii')
          return Buffer.concat([routeBuffer, valueBuffer32, countryCodeBuffer])
        }

        const valueHopperBuffer = a.isHopper ? uInt16LE(a.value) : valueBuffer32
        return Buffer.concat([routeBuffer, valueHopperBuffer])
      }
      case 'SET_CHANNEL_INHIBITS':
        return uInt16LE((args as SetChannelInhibitsArgs).channels.reduce((acc, bit, index) => acc | (bit << index), 0))
      case 'SET_COIN_MECH_GLOBAL_INHIBIT':
        return Buffer.from([(args as SetCoinMechGlobalInhibitArgs).enable ? 1 : 0])
      case 'SET_HOPPER_OPTIONS': {
        const a = args as SetHopperOptionsArgs
        let res = 0
        if (a.payMode) res += 1
        if (a.levelCheck) res += 2
        if (a.motorSpeed) res += 4
        if (a.cashBoxPayActive) res += 8
        return uInt16LE(res)
      }
      case 'GET_DENOMINATION_ROUTE': {
        const a = args as DenominationRouteArgs
        const valueBuffer32 = uInt32LE(a.value)
        if (protocolVersion !== null && protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(a.country_code!, 'ascii')
          return Buffer.concat([valueBuffer32, countryCodeBuffer])
        }
        return a.isHopper ? uInt16LE(a.value) : valueBuffer32
      }
      case 'SET_DENOMINATION_LEVEL': {
        const a = args as SetDenominationLevelArgs
        const valueBuffer = uInt16LE(a.value)

        if (protocolVersion !== null && protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(a.country_code!, 'ascii')
          const denominationBuffer32 = uInt32LE(a.denomination)
          return Buffer.concat([valueBuffer, denominationBuffer32, countryCodeBuffer])
        }

        const denominationBuffer = uInt16LE(a.denomination)
        return Buffer.concat([valueBuffer, denominationBuffer])
      }
      case 'SET_REFILL_MODE': {
        const a = args as SetRefillModeArgs
        let result = Buffer.alloc(0)
        switch (a.mode) {
          case 'on':
            result = Buffer.from([0x05, 0x81, 0x10, 0x11, 0x01])
            break
          case 'off':
            result = Buffer.from([0x05, 0x81, 0x10, 0x11, 0x00])
            break
          case 'get':
            result = Buffer.from([0x05, 0x81, 0x10, 0x01])
            break
        }
        return result
      }
      case 'HOST_PROTOCOL_VERSION':
        return Buffer.from([(args as HostProtocolVersionArgs).version])
      case 'SET_BAR_CODE_CONFIGURATION': {
        const a = args as BarCodeConfigArgs
        const enable: Record<string, number> = { none: 0, top: 1, bottom: 2, both: 3 }
        const number = Math.min(Math.max(a.numChar || 6, 6), 24)
        return Buffer.from([enable[a.enable || 'none'], 0x01, number])
      }
      case 'SET_BAR_CODE_INHIBIT_STATUS': {
        const a = args as BarCodeInhibitArgs
        let byte = 0xff
        if (!a.currencyRead) byte &= 0xfe
        if (!a.barCode) byte &= 0xfd
        return Buffer.from([byte])
      }
      case 'PAYOUT_AMOUNT': {
        const a = args as PayoutAmountArgs
        const amountBuffer = uInt32LE(a.amount)

        if (protocolVersion !== null && protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(a.country_code!, 'ascii')
          const testBuffer = Buffer.from([a.test ? 0x19 : 0x58])
          return Buffer.concat([amountBuffer, countryCodeBuffer, testBuffer])
        }

        return amountBuffer
      }
      case 'GET_DENOMINATION_LEVEL': {
        const a = args as GetDenominationLevelArgs
        const amountBuffer = uInt32LE(a.amount)

        if (protocolVersion !== null && protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(a.country_code!, 'ascii')
          return Buffer.concat([amountBuffer, countryCodeBuffer])
        }

        return amountBuffer
      }
      case 'FLOAT_AMOUNT': {
        const a = args as FloatAmountArgs
        const minBuffer = uInt16LE(a.min_possible_payout)
        const amountBuffer = uInt32LE(a.amount)

        if (protocolVersion !== null && protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(a.country_code!, 'ascii')
          const testBuffer = Buffer.from([a.test ? 0x19 : 0x58])
          return Buffer.concat([minBuffer, amountBuffer, countryCodeBuffer, testBuffer])
        }

        return Buffer.concat([minBuffer, amountBuffer])
      }
      case 'SET_COIN_MECH_INHIBITS': {
        const a = args as CoinMechInhibitsArgs
        const inhibitBuffer = Buffer.from([a.inhibited ? 0x00 : 0x01])
        const amountBuffer = uInt16LE(a.amount)

        if (protocolVersion !== null && protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(a.country_code!, 'ascii')
          return Buffer.concat([inhibitBuffer, amountBuffer, countryCodeBuffer])
        }

        return Buffer.concat([inhibitBuffer, amountBuffer])
      }
      case 'FLOAT_BY_DENOMINATION':
      case 'PAYOUT_BY_DENOMINATION': {
        const a = args as PayoutByDenominationArgs
        const tmpBufferArray: Buffer[] = [Buffer.from([a.value.length])]
        const testBuffer = Buffer.from([a.test ? 0x19 : 0x58])

        for (let i = 0; i < a.value.length; i++) {
          const countBuffer = uInt16LE(a.value[i].number)
          const denominationBuffer = uInt32LE(a.value[i].denomination)
          const countryCodeBuffer = Buffer.from(a.value[i].country_code, 'ascii')
          tmpBufferArray.push(countBuffer, denominationBuffer, countryCodeBuffer)
        }

        tmpBufferArray.push(testBuffer)

        return Buffer.concat(tmpBufferArray)
      }
      case 'SET_VALUE_REPORTING_TYPE':
        return Buffer.from([(args as SetValueReportingTypeArgs).reportBy === 'channel' ? 0x01 : 0x00])
      case 'SET_BAUD_RATE': {
        const a = args as SetBaudRateArgs
        let byte = 0
        switch (a.baudrate) {
          case 9600:
            byte = 0
            break
          case 38400:
            byte = 1
            break
          case 115200:
            byte = 2
            break
        }
        return Buffer.from([byte, a.reset_to_default_on_reset ? 0 : 1])
      }
      case 'CONFIGURE_BEZEL': {
        const a = args as ConfigureBezelArgs
        return Buffer.concat([Buffer.from(a.RGB, 'hex'), Buffer.from([a.volatile ? 0 : 1])])
      }
      case 'ENABLE_PAYOUT_DEVICE': {
        const a = args as EnablePayoutDeviceArgs
        let byte = 0
        byte += a.GIVE_VALUE_ON_STORED || a.REQUIRE_FULL_STARTUP ? 1 : 0
        byte += a.NO_HOLD_NOTE_ON_PAYOUT || a.OPTIMISE_FOR_PAYIN_SPEED ? 2 : 0
        return Buffer.from([byte])
      }
      case 'SET_FIXED_ENCRYPTION_KEY':
        return Buffer.from((args as SetFixedEncryptionKeyArgs).fixedKey, 'hex').swap64()
      case 'COIN_MECH_OPTIONS':
        return Buffer.from([(args as CoinMechOptionsArgs).ccTalk ? 1 : 0])
      default:
        return Buffer.alloc(0)
    }
  }
  return Buffer.alloc(0)
}

// ---------------------------------------------------------------------------
// parseData
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// stuffBuffer
// ---------------------------------------------------------------------------

export function stuffBuffer(inputBuffer: Buffer): Buffer {
  const outputBuffer = Buffer.allocUnsafe(inputBuffer.length * 2)
  let j = 0

  for (let i = 0; i < inputBuffer.length; i++) {
    const byte = inputBuffer[i]
    outputBuffer[j++] = byte

    if (byte === 0x7f) {
      outputBuffer[j++] = 0x7f
    }
  }

  return outputBuffer.subarray(0, j)
}

// ---------------------------------------------------------------------------
// validateNodeVersion
// ---------------------------------------------------------------------------

export function validateNodeVersion(): void {
  if (!satisfies(process.version, engines.node)) {
    throw new Error(`Node.js version must be ${engines.node}`)
  }
}

// ---------------------------------------------------------------------------
// extractPacketData
// ---------------------------------------------------------------------------

export function extractPacketData(buffer: Buffer, encryptKey: Buffer | null, count: number): Buffer {
  if (buffer[0] !== STX) {
    throw new Error('Unknown response')
  }

  buffer = buffer.subarray(1)
  const dataLength = buffer[1]
  const packetData = buffer.subarray(2, dataLength + 2)
  const crcData = buffer.subarray(0, dataLength + 2)
  const CRC = CRC16(crcData)

  const crcCheck = buffer.subarray(-2)
  if (!CRC.equals(crcCheck)) {
    throw new Error('Wrong CRC16')
  }

  let extractedData: Buffer = packetData

  if (encryptKey !== null && packetData[0] === STEX) {
    const decryptedData = decrypt(encryptKey, Buffer.from(packetData.subarray(1)))

    log('Decrypted:', chalk.red(Buffer.from(decryptedData).toString('hex')))

    const eLength = decryptedData[0]
    const eCount = Buffer.from(decryptedData.subarray(1, 5)).readUInt32LE()
    extractedData = decryptedData.subarray(5, eLength + 5)

    if (eCount !== count + 1) {
      throw new Error('Encrypted counter mismatch')
    }
  }

  return extractedData
}

// ---------------------------------------------------------------------------
// generateKeys
// ---------------------------------------------------------------------------

export function generateKeys(): GeneratedKeys {
  let generator = crypto.generatePrimeSync(16, { bigint: true, safe: true }) as bigint
  let modulus = crypto.generatePrimeSync(16, { bigint: true, safe: true }) as bigint

  if (generator === 0n || modulus === 0n) {
    throw new Error('GENERATOR and MODULUS should be > 0')
  }

  if (generator < modulus) {
    ;[modulus, generator] = [generator, modulus]
  }

  const hostRandom = BigInt(crypto.randomBytes(2).readUInt16LE()) % 2147483648n
  const hostInter = generator ** hostRandom % modulus

  return {
    generator,
    modulus,
    hostRandom,
    hostInter,
  }
}

// ---------------------------------------------------------------------------
// getPacket
// ---------------------------------------------------------------------------

export function getPacket(command: string, argBytes: Buffer, sequence: number, encryptKey: Buffer | null = null, eCount: number = 0): Buffer {
  const cmd = (commandList as Record<string, CommandEntry>)[command]
  if (cmd.args && argBytes.length === 0) {
    throw new Error('Command requires arguments')
  }

  const SEQ_SLAVE_ID = sequence
  let DATA: number[] = [cmd.code, ...argBytes]

  if (encryptKey !== null) {
    const eCOUNT = Buffer.alloc(4)
    eCOUNT.writeUInt32LE(eCount, 0)

    const ePACKING = crypto.randomBytes((16 - ((DATA.length + 7) % 16)) % 16)

    const crcPacket = [DATA.length, ...eCOUNT, ...DATA, ...ePACKING]
    const ENCRYPTED_DATA = encrypt(encryptKey, Buffer.from([...crcPacket, ...CRC16(crcPacket)]))

    DATA = [STEX, ...ENCRYPTED_DATA]
  }

  const crcPacket = [SEQ_SLAVE_ID, DATA.length, ...DATA]
  const PACKET = [...crcPacket, ...CRC16(crcPacket)]

  const STUFFED_PACKET = Buffer.concat([Buffer.from([STX]), stuffBuffer(Buffer.from(PACKET))])

  return STUFFED_PACKET
}

// ---------------------------------------------------------------------------
// createSSPHostEncryptionKey
// ---------------------------------------------------------------------------

export function createSSPHostEncryptionKey(buffer: Buffer, keys: Pick<SSPKeys, 'fixedKey' | 'hostRandom' | 'modulus'>): EncryptionKeyResult {
  const { fixedKey, hostRandom, modulus } = keys
  const slaveInterKey = Buffer.from(buffer).readBigInt64LE()
  const key = slaveInterKey ** hostRandom! % modulus!
  const encryptKey = Buffer.concat([Buffer.from(fixedKey, 'hex').swap64(), uInt64LE(key)])

  return {
    slaveInterKey,
    key,
    encryptKey,
  }
}
