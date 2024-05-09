const crypto = require('node:crypto')
const { satisfies } = require('semver')
const chalk = require('chalk')
const debug = require('debug')('ssp')
const statusDesc = require('./static/status_desc.json')
const unitType = require('./static/unit_type.json')
const rejectNote = require('./static/reject_note.json')
const commandList = require('./static/commands.json')
const { engines } = require('../package.json')

const STX = 0x7f
const STEX = 0x7e

/**
 * Returns the absolute value of a BigInt.
 *
 * @param {BigInt} n - The BigInt for which to calculate the absolute value.
 * @returns {BigInt} - The absolute value of the input BigInt.
 */
const absBigInt = n => (n < 0n ? -n : n)

/**
 * Encrypts data using AES encryption with ECB mode.
 *
 * @param {Buffer} key - The key for encryption.
 * @param {Buffer} data - The data to be encrypted.
 * @returns {Buffer} - The encrypted data.
 * @throws {Error} - Throws an error if key or data is not provided.
 */
function encrypt(key, data) {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  // Create cipher using ECB mode (Electronic Codebook)
  const cipher = crypto.createCipheriv('aes-128-ecb', key, null)

  // Enable automatic padding
  cipher.setAutoPadding(false)

  // Encrypt the data
  const encryptedData = Buffer.concat([cipher.update(data), cipher.final()])

  return encryptedData
}

/**
 * Decrypts data using AES decryption with ECB mode.
 *
 * @param {Buffer} key - The key for decryption.
 * @param {Buffer} data - The data to be decrypted.
 * @returns {Buffer} - The decrypted data.
 * @throws {Error} - Throws an error if key or data is not provided.
 */
function decrypt(key, data) {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  // Create decipher using ECB mode (Electronic Codebook)
  const decipher = crypto.createDecipheriv('aes-128-ecb', key, null)

  // Enable automatic padding
  decipher.setAutoPadding(false)

  // Decrypt the data
  const decryptedData = Buffer.concat([decipher.update(data), decipher.final()])

  return decryptedData
}

/**
 * Reads bytes from a Buffer starting from the specified index with the given length.
 *
 * @param {Buffer} buffer - The Buffer from which to read bytes.
 * @param {number} startIndex - The starting index from which to begin reading.
 * @param {number} length - The number of bytes to read.
 * @returns {Buffer} - A new Buffer containing the extracted bytes.
 * @throws {Error} - Throws an error if the input is not a Buffer, if the start index is invalid,
 *                   or if the length exceeds the buffer size.
 */
function readBytesFromBuffer(buffer, startIndex, length) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer object')
  }

  // Ensure the provided index is within the buffer's bounds
  if (startIndex < 0 || startIndex >= buffer.length) {
    throw new Error('Invalid start index')
  }

  // Ensure the requested length doesn't exceed the buffer's remaining size
  if (length < 0 || startIndex + length > buffer.length) {
    throw new Error('Invalid length or exceeds buffer size')
  }

  // Use subarray to extract the specified range of bytes
  return buffer.subarray(startIndex, startIndex + length)
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

/**
 * Calculate CRC16 checksum for the given source data.
 * @param {number[] | Buffer} source - The source data represented as an array of numbers or a Buffer object.
 * @returns {Buffer} A Buffer containing the CRC16 checksum bytes.
 */
function CRC16(source) {
  const CRC_SSP_SEED = 0xffff
  const CRC_SSP_POLY = 0x8005
  let crc = CRC_SSP_SEED

  for (let i = 0; i < source.length; ++i) {
    crc ^= source[i] << 8
    for (let j = 0; j < 8; ++j) {
      crc = crc & 0x8000 ? (crc << 1) ^ CRC_SSP_POLY : crc << 1
    }
  }

  // Ensure CRC is within 16-bit range
  crc &= 0xffff

  const crcBuffer = Buffer.alloc(2)
  crcBuffer.writeUInt16LE(crc, 0)
  return crcBuffer
}

/**
 * Creates a Buffer representing the given unsigned 64-bit integer in little-endian format.
 *
 * @param {bigint} number - The unsigned 64-bit integer.
 * @throws {Error} - If the input is not an unsigned 64-bit integer or is out of range.
 * @returns {Buffer} - Buffer representing the unsigned 64-bit integer in little-endian format.
 */
function uInt64LE(number) {
  if (!Number.isInteger(Number(number)) || number < 0 || number > 18446744073709551615n) {
    throw new Error('Input must be an unsigned 64-bit integer')
  }

  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64LE(BigInt(number))
  return buffer
}

/**
 * Creates a Buffer representing the given unsigned 32-bit integer in little-endian format.
 *
 * @param {number} number - The unsigned 32-bit integer.
 * @throws {Error} - If the input is not an unsigned 32-bit integer or is out of range.
 * @returns {Buffer} - Buffer representing the unsigned 32-bit integer in little-endian format.
 */
function uInt32LE(number) {
  if (!Number.isInteger(number) || number < 0 || number > 4294967295) {
    throw new Error('Input must be an unsigned 32-bit integer')
  }

  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(number)
  return buffer
}

/**
 * Creates a Buffer representing the given unsigned 16-bit integer in little-endian format.
 *
 * @param {number} number - The unsigned 16-bit integer.
 * @throws {Error} - If the input is not an unsigned 16-bit integer or is out of range.
 * @returns {Buffer} - Buffer representing the unsigned 16-bit integer in little-endian format.
 */
function uInt16LE(number) {
  if (!Number.isInteger(number) || number < 0 || number > 65535) {
    throw new Error('Input must be an unsigned 16-bit integer')
  }

  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(number)
  return buffer
}

/**
 * Creates a Buffer from given arguments.
 *
 * @param {string} command - Comand name.
 * @param {object} args - Object containing requried arguments.
 * @returns {Buffer} - Buffer of converted argumants.
 */
function argsToByte(command, args, protocolVersion) {
  if (args !== undefined) {
    switch (command) {
      case 'SET_GENERATOR':
      case 'SET_MODULUS':
      case 'REQUEST_KEY_EXCHANGE':
        return uInt64LE(args.key)
      case 'SET_DENOMINATION_ROUTE': {
        const routeBuffer = Buffer.from([args.route === 'payout' ? 0 : 1])
        const valueBuffer32 = uInt32LE(args.value)

        if (protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(args.country_code, 'ascii')
          return Buffer.concat([routeBuffer, valueBuffer32, countryCodeBuffer])
        }

        const valueHopperBuffer = args.isHopper ? uInt16LE(args.value) : valueBuffer32
        return Buffer.concat([routeBuffer, valueHopperBuffer])
      }
      case 'SET_CHANNEL_INHIBITS':
        return uInt16LE(args.channels.reduce((acc, bit, index) => acc | (bit << index), 0))
      case 'SET_COIN_MECH_GLOBAL_INHIBIT':
        return Buffer.from([args.enable ? 1 : 0])
      case 'SET_HOPPER_OPTIONS': {
        let res = 0
        if (args.payMode) res += 1
        if (args.levelCheck) res += 2
        if (args.motorSpeed) res += 4
        if (args.cashBoxPayActive) res += 8
        return uInt16LE(res)
      }
      case 'GET_DENOMINATION_ROUTE': {
        const valueBuffer32 = uInt32LE(args.value)
        if (protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(args.country_code, 'ascii')
          return Buffer.concat([valueBuffer32, countryCodeBuffer])
        }
        return args.isHopper ? uInt16LE(args.value) : valueBuffer32
      }
      case 'SET_DENOMINATION_LEVEL': {
        const valueBuffer = uInt16LE(args.value)

        if (protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(args.country_code, 'ascii')
          const denominationBuffer32 = uInt32LE(args.denomination)
          return Buffer.concat([valueBuffer, denominationBuffer32, countryCodeBuffer])
        }

        const denominationBuffer = uInt16LE(args.denomination)
        return Buffer.concat([valueBuffer, denominationBuffer])
      }
      case 'SET_REFILL_MODE': {
        let result = Buffer.alloc(0)
        switch (args.mode) {
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
        return Buffer.from([args.version])
      case 'SET_BAR_CODE_CONFIGURATION': {
        const enable = { none: 0, top: 1, bottom: 2, both: 3 }
        const number = Math.min(Math.max(args.numChar || 6, 6), 24)
        return Buffer.from([enable[args.enable || 'none'], 0x01, number])
      }
      case 'SET_BAR_CODE_INHIBIT_STATUS': {
        let byte = 0xff
        if (!args.currencyRead) byte &= 0xfe
        if (!args.barCode) byte &= 0xfd
        return Buffer.from([byte])
      }
      case 'PAYOUT_AMOUNT': {
        const amountBuffer = uInt32LE(args.amount)

        if (protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(args.country_code, 'ascii')
          const testBuffer = Buffer.from([args.test ? 0x19 : 0x58])
          return Buffer.concat([amountBuffer, countryCodeBuffer, testBuffer])
        }

        return amountBuffer
      }
      case 'GET_DENOMINATION_LEVEL': {
        const amountBuffer = uInt32LE(args.amount)

        if (protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(args.country_code, 'ascii')
          return Buffer.concat([amountBuffer, countryCodeBuffer])
        }

        return amountBuffer
      }
      case 'FLOAT_AMOUNT': {
        const minBuffer = uInt16LE(args.min_possible_payout)
        const amountBuffer = uInt32LE(args.amount)

        if (protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(args.country_code, 'ascii')
          const testBuffer = Buffer.from([args.test ? 0x19 : 0x58])
          return Buffer.concat([minBuffer, amountBuffer, countryCodeBuffer, testBuffer])
        }

        return Buffer.concat([minBuffer, amountBuffer])
      }
      case 'SET_COIN_MECH_INHIBITS': {
        const inhibitBuffer = Buffer.from([args.inhibited ? 0x00 : 0x01])
        const amountBuffer = uInt16LE(args.amount)

        if (protocolVersion >= 6) {
          const countryCodeBuffer = Buffer.from(args.country_code, 'ascii')
          return Buffer.concat([inhibitBuffer, amountBuffer, countryCodeBuffer])
        }

        return Buffer.concat([inhibitBuffer, amountBuffer])
      }
      case 'FLOAT_BY_DENOMINATION':
      case 'PAYOUT_BY_DENOMINATION': {
        const tmpBufferArray = [Buffer.from([args.value.length])]
        const testBuffer = Buffer.from([args.test ? 0x19 : 0x58])

        for (let i = 0; i < args.value.length; i++) {
          const countBuffer = uInt16LE(args.value[i].number)
          const denominationBuffer = uInt32LE(args.value[i].denomination)
          const countryCodeBuffer = Buffer.from(args.value[i].country_code, 'ascii')
          tmpBufferArray.push(countBuffer, denominationBuffer, countryCodeBuffer)
        }

        tmpBufferArray.push(testBuffer)

        return Buffer.concat(tmpBufferArray)
      }
      case 'SET_VALUE_REPORTING_TYPE':
        return Buffer.from([args.reportBy === 'channel' ? 0x01 : 0x00])
      case 'SET_BAUD_RATE': {
        let byte = 9600
        switch (args.baudrate) {
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
        return Buffer.from([byte, args.reset_to_default_on_reset ? 0 : 1])
      }
      case 'CONFIGURE_BEZEL':
        return Buffer.concat([Buffer.from(args.RGB, 'hex'), Buffer.from([args.volatile ? 0 : 1])])
      case 'ENABLE_PAYOUT_DEVICE': {
        let byte = 0
        byte += args.GIVE_VALUE_ON_STORED || args.REQUIRE_FULL_STARTUP ? 1 : 0
        byte += args.NO_HOLD_NOTE_ON_PAYOUT || args.OPTIMISE_FOR_PAYIN_SPEED ? 2 : 0
        return Buffer.from([byte])
      }
      case 'SET_FIXED_ENCRYPTION_KEY':
        return Buffer.from(args.fixedKey, 'hex').swap64()
      case 'COIN_MECH_OPTIONS':
        return Buffer.from([args.ccTalk ? 1 : 0])
      default:
        return Buffer.alloc(0)
    }
  }
  return Buffer.alloc(0)
}

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

/**
 * Stuff bytes in a buffer: if a byte of value 0x7f is found, adds another byte with the value 0x7f after it.
 * @param {Buffer} inputBuffer - The input buffer to stuff.
 * @returns {Buffer} - The stuffed buffer.
 */
function stuffBuffer(inputBuffer) {
  const outputBuffer = Buffer.allocUnsafe(inputBuffer.length * 2) // Allocate buffer with double the size
  let j = 0

  for (let i = 0; i < inputBuffer.length; i++) {
    const byte = inputBuffer[i]
    outputBuffer[j++] = byte // Copy the original byte to the output buffer

    // If the byte has a value of 0x7f, add another byte with the value 0x7f after it
    if (byte === 0x7f) {
      outputBuffer[j++] = 0x7f
    }
  }

  return outputBuffer.subarray(0, j) // Truncate the buffer to the actual size
}

/**
 * Validates if the current Node.js version satisfies the required version.
 * @throws {Error} Throws an error if the current Node.js version does not satisfy the required version.
 */
function validateNodeVersion() {
  if (!satisfies(process.version, engines.node)) {
    throw new Error(`Node.js version must be ${engines.node}`)
  }
}

/**
 * Extracts data from a packet buffer.
 *
 * @param {Buffer} buffer - The packet buffer to extract data from.
 * @param {Buffer|null} encryptKey - The encryption key.
 * @param {number} count - Current count value.
 * @returns {Buffer} - Extracted data.
 * @throws {Error} - Throws an error if the packet format is invalid, CRC check fails, or decryption encounters an error.
 */
function extractPacketData(buffer, encryptKey, count) {
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

  let extractedData = packetData

  if (encryptKey !== null && packetData[0] === STEX) {
    const decryptedData = decrypt(encryptKey, Buffer.from(packetData.subarray(1)))

    debug('Decrypted:', chalk.red(Buffer.from(decryptedData).toString('hex')))

    const eLength = decryptedData[0]
    const eCount = Buffer.from(decryptedData.subarray(1, 5)).readUInt32LE()
    extractedData = decryptedData.subarray(5, eLength + 5)

    if (eCount !== count + 1) {
      throw new Error('Encrypted counter mismatch')
    }
  }

  return extractedData
}

/**
 * Generates cryptographic keys for a secure communication protocol.
 * @returns {Object} An object containing the generated keys:
 *   - generator: The generator value for the keys.
 *   - modulus: The modulus value for the keys.
 *   - hostRandom: A random value generated for the host.
 *   - hostInter: Intermediate value computed for the host.
 * @throws {Error} Throws an error if either generator or modulus is zero.
 */
function generateKeys() {
  // Generate a prime number for the generator and modulus with specified bit length.
  let generator = crypto.generatePrimeSync(16, { bigint: true, safe: true })
  let modulus = crypto.generatePrimeSync(16, { bigint: true, safe: true })

  // Check if either generator or modulus is zero, and throw an error if so.
  if (generator === 0n || modulus === 0n) {
    throw new Error('GENERATOR and MODULUS should be > 0')
  }

  // If generator is less than modulus, swap their values.
  if (generator < modulus) {
    ;[modulus, generator] = [generator, modulus]
  }

  // Generate a random number for the host and calculate hostInter using modular exponentiation.
  let hostRandom = BigInt(crypto.randomBytes(2).readUInt16LE()) % 2147483648n
  let hostInter = generator ** hostRandom % modulus

  // Return the generated keys as an object.
  return {
    generator,
    modulus,
    hostRandom,
    hostInter,
  }
}

/**
 * Constructs a packet based on the provided parameters.
 * @param {string} command - The command name.
 * @param {Buffer} argBytes - The buffer containing arguments.
 * @param {number} sequence - The sequence number.
 * @param {Buffer|null} encryptKey - The encryption key. Defaults to null if not provided.
 * @param {number} eCount - The encryption count.
 * @returns {Buffer} - The constructed packet.
 */
function getPacket(command, argBytes, sequence, encryptKey = null, eCount) {
  if (commandList[command].args && argBytes.length === 0) {
    throw new Error('Command requires arguments')
  }

  const SEQ_SLAVE_ID = sequence
  let DATA = [commandList[command].code, ...argBytes]

  // Encrypted packet
  if (encryptKey !== null) {
    const eCOUNT = Buffer.alloc(4)
    eCOUNT.writeUInt32LE(eCount, 0)

    /**

     * Random data to make the length of the length + count + data + packing + CRCL + CRCH to be a multiple of 16 bytes
    * 7 = DATA.length (1 byte) + eCOUNT (4 bytes) + eCRCL (1 byte) + eCRCH (1 byte)
    */
    // const ePACKING = crypto.randomBytes(Math.ceil((DATA.length + 7) / 16) * 16 - (DATA.length + 7))
    const ePACKING = crypto.randomBytes((16 - ((DATA.length + 7) % 16)) % 16)

    // data to calculate CRC on
    const crcPacket = [DATA.length, ...eCOUNT, ...DATA, ...ePACKING]
    const ENCRYPTED_DATA = encrypt(encryptKey, Buffer.from([...crcPacket, ...CRC16(crcPacket)]))

    DATA = [STEX, ...ENCRYPTED_DATA]
  }

  // data to calculate CRC on
  const crcPacket = [SEQ_SLAVE_ID, DATA.length, ...DATA]
  const PACKET = [...crcPacket, ...CRC16(crcPacket)]

  const STUFFED_PACKET = Buffer.concat([Buffer.from([STX]), stuffBuffer(PACKET)])

  return STUFFED_PACKET
}

/**
 * Creates a Secure Session Protocol (SSP) host encryption key.
 * @param {Buffer} buffer - The buffer containing slave inter key.
 * @param {object} keys - An object containing fixedKey, hostRandom, and modulus.
 * @param {string} keys.fixedKey - The fixed key in hexadecimal format.
 * @param {bigint} keys.hostRandom - The host random value.
 * @param {bigint} keys.modulus - The modulus value.
 * @returns {object} An object containing slaveInterKey, key, and encryptKey.
 */
function createSSPHostEncryptionKey(buffer, keys) {
  const { fixedKey, hostRandom, modulus } = keys
  const slaveInterKey = Buffer.from(buffer).readBigInt64LE()
  const key = slaveInterKey ** hostRandom % modulus
  const encryptKey = Buffer.concat([Buffer.from(fixedKey, 'hex').swap64(), uInt64LE(key)])

  return {
    slaveInterKey,
    key,
    encryptKey,
  }
}

module.exports = {
  absBigInt,
  argsToByte,
  CRC16,
  createSSPHostEncryptionKey,
  decrypt,
  encrypt,
  extractPacketData,
  generateKeys,
  getPacket,
  parseData,
  randomInt,
  readBytesFromBuffer,
  stuffBuffer,
  uInt16LE,
  uInt32LE,
  uInt64LE,
  validateNodeVersion,
}
