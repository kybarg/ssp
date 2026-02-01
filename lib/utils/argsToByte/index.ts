import { uInt16LE } from '../uInt16LE'
import { uInt32LE } from '../uInt32LE'
import { uInt64LE } from '../uInt64LE'

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

export type CommandArgs =
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
