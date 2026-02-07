# @kybarg/ssp - Project Context for Claude Agents

## Project Overview

**Name:** @kybarg/ssp  
**Purpose:** Node.js implementation of Encrypted Smiley® Secure Protocol (eSSP/SSP)  
**Type:** Hardware communication library for cash handling devices  
**License:** MIT  
**Main Entry:** `src/index.js`

## Supported Hardware Devices

NV9USB, NV10USB, BV20, BV50, BV100, NV200, NV200 Spectral, SMART Hopper, SMART Payout, NV11, NV22

**Note:** NV11 is not fully tested and requires maintainer support.

## Project Structure

```
D:\Projects\ssp\
├── src/
│   ├── index.js              # Main SSP class (EventEmitter-based)
│   ├── utils/                # Utility functions (modular structure)
│   │   ├── index.js          # Main exports (re-exports all utils)
│   │   ├── absBigInt.js      # Absolute value of BigInt
│   │   ├── absBigInt.test.js
│   │   ├── argsToByte.js     # Convert command args to bytes
│   │   ├── argsToByte.test.js
│   │   ├── CRC16.js          # CRC16 checksum calculation
│   │   ├── CRC16.test.js
│   │   ├── createSSPHostEncryptionKey.js
│   │   ├── createSSPHostEncryptionKey.test.js
│   │   ├── decrypt.js        # AES-128-ECB decryption
│   │   ├── decrypt.test.js
│   │   ├── encrypt.js        # AES-128-ECB encryption
│   │   ├── encrypt.test.js
│   │   ├── extractPacketData.js
│   │   ├── extractPacketData.test.js
│   │   ├── generateKeys.js   # Diffie-Hellman key generation
│   │   ├── generateKeys.test.js
│   │   ├── getPacket.js      # Construct SSP packets
│   │   ├── getPacket.test.js
│   │   ├── parseData.js      # Parse device responses
│   │   ├── parseData.test.js
│   │   ├── randomInt.js      # Random integer generation
│   │   ├── randomInt.test.js
│   │   ├── readBytesFromBuffer.js
│   │   ├── readBytesFromBuffer.test.js
│   │   ├── stuffBuffer.js    # Byte stuffing for protocol
│   │   ├── stuffBuffer.test.js
│   │   ├── uInt16LE.js       # 16-bit little-endian conversion
│   │   ├── uInt16LE.test.js
│   │   ├── uInt32LE.js       # 32-bit little-endian conversion
│   │   ├── uInt32LE.test.js
│   │   ├── uInt64LE.js       # 64-bit little-endian conversion
│   │   ├── uInt64LE.test.js
│   │   ├── validateNodeVersion.js
│   │   └── validateNodeVersion.test.js
│   ├── parser/
│   │   ├── index.js          # SSPParser (Transform stream for serial data)
│   │   └── index.test.js     # Parser tests
│   ├── static/
│   │   ├── commands.json     # Command definitions (~80+ commands)
│   │   ├── status_desc.json  # Status code descriptions
│   │   ├── reject_note.json  # Note rejection reasons
│   │   └── unit_type.json    # Device type mappings
├── example.js                # Usage example
├── package.json
├── README.md
├── scripts/
│   └── docs.js               # Documentation generator
└── docs/
    ├── readme.md
    ├── commands.md
    └── events.md
```

## Core Architecture

### 1. Main Class: SSP (src/index.js)

**Extends:** `EventEmitter`  
**Dependencies:** `serialport`, `crypto`, `chalk`, `debug`

#### Key Properties

```javascript
// Configuration
config: {
  encryptAllCommand: true,    // Encrypt all commands (not just sensitive ones)
  id: 0,                      // Device ID for multi-device setups
  timeout: 1000,              // Command response timeout (ms)
  commandRetries: 20,         // Max retry attempts
  pollingInterval: 300        // Poll interval (ms)
}

// Keys for encryption
keys: {
  encryptKey: null,           // AES-128-ECB encryption key
  fixedKey: '0123456701234567', // Device internal key
  generator: null,            // Diffie-Hellman generator
  hostInter: null,            // DH host intermediate
  hostRandom: null,           // DH host random
  key: null,                  // DH shared key
  modulus: null,              // DH modulus
  slaveInterKey: null         // DH slave intermediate
}

// State management
state: {
  enabled: false,             // Device accepting cash
  polling: false,             // Polling active
  processing: false           // Command in progress
}

// Protocol info
protocol_version: null        // Protocol version (set after SETUP_REQUEST)
unit_type: null              // Device type (set after SETUP_REQUEST/UNIT_DATA)
```

#### Core Methods

**Connection Management:**
- `open(port, options)` - Opens serial port connection
- `close()` - Closes serial port connection

**Encryption Setup:**
- `initEncryption()` - Performs Diffie-Hellman key exchange (3 commands)
  1. SET_GENERATOR
  2. SET_MODULUS
  3. REQUEST_KEY_EXCHANGE

**Device Control:**
- `enable()` - Enable device for cash acceptance, starts polling
- `disable()` - Disable device, stops polling
- `poll(status)` - Start/stop polling loop

**Command Execution:**
- `command(commandName, args)` - Execute any SSP command
- `sendToDevice(command, txBuffer, txBufferPlain)` - Low-level send with retry logic

#### Event Emitters

**System Events:**
- `OPEN` - Port opened
- `CLOSE` - Port closed
- `ERROR` - Error occurred
- `DEBUG` - Debug data (tx/rx buffers with timestamps)

**Device Events (from POLL):**
- `READ_NOTE` - Note read, includes channel info
- `NOTE_STACKED` - Note accepted
- `NOTE_REJECTED` - Note rejected
- `CREDIT_NOTE` - Credit given
- `SLAVE_RESET` - Device reset
- `DISABLED` - Device disabled
- `FRAUD_ATTEMPT` - Fraud detected
- `DISPENSING` / `DISPENSED` - Payout events
- ... (50+ event types in status_desc.json)

### 2. Utilities (src/utils/)

**Utilities are now organized into individual modular files for better maintainability:**

**Encryption/Decryption** (`src/utils/`):
- `encrypt.js` - AES-128-ECB encryption
- `decrypt.js` - AES-128-ECB decryption
- `generateKeys.js` - Generate Diffie-Hellman keys
- `createSSPHostEncryptionKey.js` - Create AES key from DH exchange

**Binary/Buffer Conversion** (`src/utils/`):
- `uInt64LE.js` - BigInt to 8-byte LE Buffer
- `uInt32LE.js` - Int to 4-byte LE Buffer
- `uInt16LE.js` - Int to 2-byte LE Buffer
- `CRC16.js` - Calculate CRC16 checksum
- `readBytesFromBuffer.js` - Safe buffer reading
- `absBigInt.js` - Absolute value of BigInt

**Packet Building** (`src/utils/`):
- `getPacket.js` - Build complete SSP packet
- `argsToByte.js` - Convert command args to bytes
- `stuffBuffer.js` - Byte stuffing (escape 0x7F bytes)

**Packet Parsing** (`src/utils/`):
- `extractPacketData.js` - Extract and decrypt packet data
- `parseData.js` - Parse response data from device

**Miscellaneous** (`src/utils/`):
- `randomInt.js` - Random integer generation
- `validateNodeVersion.js` - Ensure Node.js >= 20.0.0

**Main Export** (`src/utils/index.js`):
- Re-exports all utilities for backward compatibility with existing code

**Tests:**
- Each utility function has a corresponding `.test.js` file with full Jest test coverage

### 3. Serial Parser (src/parser/index.js)

**Class:** `SSPParser extends Transform`

**Purpose:** Handles byte stuffing and packet boundary detection in serial stream

**Protocol:**
- STX byte: `0x7F` (packet start)
- Byte stuffing: `0x7F` doubled when in data
- Packet format: `STX | SEQ | LEN | DATA | CRC16`

**State Machine:**
- Tracks packet boundaries
- Handles stuffed bytes
- Emits complete packets

## Communication Protocol

### Packet Structure

**Unencrypted:**
```
STX (0x7F) | SEQUENCE | LENGTH | COMMAND | [ARGS] | CRC16_LOW | CRC16_HIGH
```

**Encrypted:**
```
STX (0x7F) | SEQUENCE | LENGTH | STEX (0x7E) | ENCRYPTED_DATA | CRC16_LOW | CRC16_HIGH

ENCRYPTED_DATA = AES-128-ECB(
  DATA_LENGTH | 
  COUNTER (4 bytes LE) | 
  COMMAND | 
  [ARGS] | 
  PADDING (to 16-byte boundary) | 
  INNER_CRC16
)
```

### Sequence Byte

- Alternates between `0x80` and `0x00`
- Combined with device ID: `id | sequence`
- SYNC command resets to `0x80`

### Encryption Counter

- Increments for each encrypted command sent/received
- Used to prevent replay attacks
- Mismatches throw error

## Typical Usage Flow

```javascript
1. open(port) - Connect to serial port
2. command('SYNC') - Synchronize sequence
3. command('HOST_PROTOCOL_VERSION', {version: 6}) - Set protocol
4. initEncryption() - Perform DH key exchange
5. command('GET_SERIAL_NUMBER') - Get device serial
6. command('SETUP_REQUEST') - Get device capabilities
7. command('SET_CHANNEL_INHIBITS', {channels: [...]}) - Enable channels
8. enable() - Enable device and start polling
   - Sends ENABLE command
   - Starts poll() loop
   - Emits events from POLL responses
9. Listen to events: 'READ_NOTE', 'NOTE_STACKED', etc.
10. disable() - Stop polling and disable device
11. close() - Close serial port
```

## Important Constants

**Serial Port Defaults:**
```javascript
{
  baudRate: 9600,
  dataBits: 8,
  stopBits: 2,
  parity: 'none',
  highWaterMark: 64 * 1024
}
```

**Protocol Bytes:**
- `STX = 0x7F` - Start transmission
- `STEX = 0x7E` - Start encrypted transmission
- `CRC_SSP_SEED = 0xFFFF`
- `CRC_SSP_POLY = 0x8005`

## Command Categories (commands.json)

**Device Control:** RESET, ENABLE, DISABLE, SYNC  
**Setup:** SETUP_REQUEST, HOST_PROTOCOL_VERSION, UNIT_DATA  
**Encryption:** SET_GENERATOR, SET_MODULUS, REQUEST_KEY_EXCHANGE  
**Channel Config:** SET_CHANNEL_INHIBITS, CHANNEL_VALUE_REQUEST  
**Polling:** POLL, POLL_WITH_ACK  
**Actions:** REJECT_BANKNOTE, EMPTY_ALL, SMART_EMPTY  
**Payout:** PAYOUT_AMOUNT, PAYOUT_BY_DENOMINATION, FLOAT_AMOUNT  
**Query:** GET_SERIAL_NUMBER, GET_FIRMWARE_VERSION, GET_COUNTERS  
**Advanced:** SET_DENOMINATION_ROUTE, CONFIGURE_BEZEL, SET_BAUD_RATE  

## Error Handling

**Retry Logic:**
- Commands retry up to `commandRetries` times (default: 20)
- After 20 failures, host assumes device crashed
- Throws error with reason

**Common Errors:**
- `'Unknown command'` - Invalid command name
- `'Command requires encryption'` - Encrypted command before initEncryption()
- `'Already processing another command'` - Concurrent command attempt
- `'TIMEOUT'` - No response within timeout
- `'Sequence flag mismatch'` - Protocol sync error
- `'Wrong CRC16'` - Data corruption
- `'Encrypted counter mismatch'` - Security error

## Testing

**Test Files:**
- `src/utils.test.js` - Utils functions
- `src/utils.parseData.test.js` - Data parsing
- `src/parser/index.test.js` - Serial parser

**Test Command:** `npm test` (Jest with coverage)

**Test Coverage:** 100% (all statements, branches, functions, and lines)

## Version Requirements

- **Node.js:** >= 20.0.0
- **npm:** >= 10.0.0

## Key Dependencies

- `serialport@^13.0.0` - Serial communication
- `chalk@^4.1.2` - Terminal colors (debug)
- `debug@^4.4.0` - Debug logging
- `semver@^7.7.1` - Version validation

## Development Notes

### Protocol Version Impact

- Protocol version affects packet format (set via HOST_PROTOCOL_VERSION)
- Version >= 6: Extended channel data with country codes
- Version >= 7: Enhanced error reporting
- Version >= 8: Additional power-up events
- Always check `protocolVersion` in `argsToByte()` and `parseData()`

### Multi-Device Support

- Use `id` config (0-15) to address specific device
- Combined with sequence byte for routing

### Debugging

- Enable debug output: `DEBUG=ssp node example.js`
- Listen to `DEBUG` event for tx/rx packet inspection
- Buffers logged in hex format with timestamps

### Security

- Uses AES-128-ECB (per ITL spec, not secure mode but required)
- Diffie-Hellman key exchange for session keys
- Fixed key stored in device firmware
- Encryption counter prevents replay attacks

## Common Integration Patterns

**Accept Cash:**
```javascript
eSSP.on('READ_NOTE', result => {
  // Validate note, check channel value
  // Call REJECT_BANKNOTE or wait for NOTE_STACKED
})
```

**Reject Specific Denominations:**
```javascript
if (channels[result.channel].value === 500) {
  eSSP.command('REJECT_BANKNOTE')
}
```

**Handle Errors:**
```javascript
eSSP.on('NOTE_REJECTED', () => {
  eSSP.command('LAST_REJECT_CODE').then(result => {
    console.log(result.info.description)
  })
})
```

**Payout:**
```javascript
await eSSP.command('PAYOUT_AMOUNT', {
  amount: 1000,
  country_code: 'USD',
  test: false
})
```

## File References for Common Tasks

**Adding new command:** 
1. Edit `src/static/commands.json`
2. Add case to `src/utils/argsToByte.js` (if command has arguments)
3. Add parsing case to `src/utils/parseData.js` POLL or specific command section

**Adding new event:** 
1. Edit `src/static/status_desc.json`
2. Add parsing case to `src/utils/parseData.js` POLL section

**Modifying encryption:**
- `src/utils/encrypt.js` - Encryption logic
- `src/utils/decrypt.js` - Decryption logic
- `src/utils/generateKeys.js` - Key generation
- `src/utils/createSSPHostEncryptionKey.js` - Key derivation

**Changing packet format:**
- `src/utils/getPacket.js` - Packet construction
- `src/utils/extractPacketData.js` - Packet parsing
- `src/utils/stuffBuffer.js` - Byte stuffing

**Binary conversions:**
- `src/utils/uInt16LE.js` - 16-bit conversions
- `src/utils/uInt32LE.js` - 32-bit conversions
- `src/utils/uInt64LE.js` - 64-bit conversions
- `src/utils/CRC16.js` - Checksum calculation

**Serial parsing:** Edit `src/parser/index.js` Transform stream

**Updating documentation:** Run `npm run docs` to regenerate docs/commands.md and docs/events.md from src/static/commands.json and src/static/status_desc.json

## Branch Information

- **Current branch:** typescript-ai
- **Main branch:** main
- **Status:** Clean working directory
