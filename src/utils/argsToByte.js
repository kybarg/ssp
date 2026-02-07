const uInt16LE = require('./uInt16LE')
const uInt32LE = require('./uInt32LE')
const uInt64LE = require('./uInt64LE')

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

module.exports = argsToByte
