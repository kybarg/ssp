const statusDesc = require('../../static/status_desc.json')

const parseRequestKeyExchange = require('./commands/76_REQUEST_KEY_EXCHANGE')
const parseSetupRequest = require('./commands/5_SETUP_REQUEST')
const parseGetSerialNumber = require('./commands/12_GET_SERIAL_NUMBER')
const parseUnitData = require('./commands/13_UNIT_DATA')
const parseChannelValueRequest = require('./commands/14_CHANNEL_VALUE_REQUEST')
const parseChannelSecurityData = require('./commands/15_CHANNEL_SECURITY_DATA')
const parseChannelReTeachData = require('./commands/16_CHANNEL_RE_TEACH_DATA')
const parseLastRejectCode = require('./commands/23_LAST_REJECT_CODE')
const parseGetFirmwareVersion = require('./commands/32_GET_FIRMWARE_VERSION')
const parseGetAllLevels = require('./commands/34_GET_ALL_LEVELS')
const parseGetBarCodeReaderConfiguration = require('./commands/35_GET_BAR_CODE_READER_CONFIGURATION')
const parseGetBarCodeInhibitStatus = require('./commands/37_GET_BAR_CODE_INHIBIT_STATUS')
const parseGetBarCodeData = require('./commands/39_GET_BAR_CODE_DATA')
const parseSetRefillMode = require('./commands/48_SET_REFILL_MODE')
const parseGetDenominationLevel = require('./commands/53_GET_DENOMINATION_LEVEL')
const parseGetDenominationRoute = require('./commands/60_GET_DENOMINATION_ROUTE')
const parseGetMinimumPayout = require('./commands/62_GET_MINIMUM_PAYOUT')
const parseGetNotePositions = require('./commands/65_GET_NOTE_POSITIONS')
const parseGetBuildRevision = require('./commands/79_GET_BUILD_REVISION')
const parseGetHopperOptions = require('./commands/81_GET_HOPPER_OPTIONS')
const parseCashboxPayoutOperationData = require('./commands/83_CASHBOX_PAYOUT_OPERATION_DATA')
const parseGetCounters = require('./commands/88_GET_COUNTERS')
const parsePoll = require('./commands/7_POLL')

const parseEnablePayoutDeviceError = require('./commands/92_ENABLE_PAYOUT_DEVICE.error')
const parsePayoutAmountError = require('./commands/51_PAYOUT_AMOUNT.error')
const parseSetValueReportingTypeError = require('./commands/69_SET_VALUE_REPORTING_TYPE.error')
const parseFloatByDenominationError = require('./commands/68_FLOAT_BY_DENOMINATION.error')
const parseStackNoteError = require('./commands/67_STACK_NOTE.error')
const parseGetNotePositionsError = require('./commands/65_GET_NOTE_POSITIONS.error')

const successHandlers = {
  REQUEST_KEY_EXCHANGE: parseRequestKeyExchange,
  SETUP_REQUEST: parseSetupRequest,
  GET_SERIAL_NUMBER: parseGetSerialNumber,
  UNIT_DATA: parseUnitData,
  CHANNEL_VALUE_REQUEST: parseChannelValueRequest,
  CHANNEL_SECURITY_DATA: parseChannelSecurityData,
  CHANNEL_RE_TEACH_DATA: parseChannelReTeachData,
  LAST_REJECT_CODE: parseLastRejectCode,
  GET_FIRMWARE_VERSION: parseGetFirmwareVersion,
  GET_DATASET_VERSION: parseGetFirmwareVersion,
  GET_ALL_LEVELS: parseGetAllLevels,
  GET_BAR_CODE_READER_CONFIGURATION: parseGetBarCodeReaderConfiguration,
  GET_BAR_CODE_INHIBIT_STATUS: parseGetBarCodeInhibitStatus,
  GET_BAR_CODE_DATA: parseGetBarCodeData,
  SET_REFILL_MODE: parseSetRefillMode,
  GET_DENOMINATION_LEVEL: parseGetDenominationLevel,
  GET_DENOMINATION_ROUTE: parseGetDenominationRoute,
  GET_MINIMUM_PAYOUT: parseGetMinimumPayout,
  GET_NOTE_POSITIONS: parseGetNotePositions,
  GET_BUILD_REVISION: parseGetBuildRevision,
  GET_HOPPER_OPTIONS: parseGetHopperOptions,
  CASHBOX_PAYOUT_OPERATION_DATA: parseCashboxPayoutOperationData,
  GET_COUNTERS: parseGetCounters,
  POLL: parsePoll,
  POLL_WITH_ACK: parsePoll,
}

const errorHandlers = {
  ENABLE_PAYOUT_DEVICE: parseEnablePayoutDeviceError,
  PAYOUT_BY_DENOMINATION: parsePayoutAmountError,
  FLOAT_AMOUNT: parsePayoutAmountError,
  PAYOUT_AMOUNT: parsePayoutAmountError,
  SET_VALUE_REPORTING_TYPE: parseSetValueReportingTypeError,
  GET_DENOMINATION_ROUTE: parseSetValueReportingTypeError,
  SET_DENOMINATION_ROUTE: parseSetValueReportingTypeError,
  FLOAT_BY_DENOMINATION: parseFloatByDenominationError,
  STACK_NOTE: parseStackNoteError,
  PAYOUT_NOTE: parseStackNoteError,
  GET_NOTE_POSITIONS: parseGetNotePositionsError,
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

    const handler = successHandlers[currentCommand]
    if (handler) {
      handler(data, result, protocolVersion, deviceUnitType)
    }
  } else {
    if (result.status === 'COMMAND_CANNOT_BE_PROCESSED') {
      const handler = errorHandlers[currentCommand]
      if (handler) {
        handler(data, result)
      }
    }
  }

  return result
}

module.exports = parseData
