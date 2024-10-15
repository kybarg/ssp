<a name="readme-top"></a>

[![NPM Version](https://img.shields.io/npm/v/%40kybarg%2Fssp)](https://npmjs.com/@kybarg/ssp) [![Codecov](https://img.shields.io/codecov/c/github/kybarg/ssp)](https://codecov.io/gh/kybarg/ssp) [![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/kybarg/ssp/.github%2Fworkflows%2Ftest.yml)
](https://github.com/kybarg/ssp/actions/workflows/node.js.yml) [![GitHub License](https://img.shields.io/github/license/kybarg/ssp)](https://github.com/kybarg/ssp/blob/main/LICENSE)

# @kybarg/ssp

Node.JS implemenation of Encrypted Smiley ® Secure Protocol (eSSP, SSP)

**Supported devices:** NV9USB, NV10USB, BV20, BV50, BV100, NV200, NV200 Spectral, SMART Hopper, SMART Payout, NV11, NV22

> [!WARNING]
>
> **NV11** is not fully tested and supported. Maintainer is required.

## Table of Contents

1. [Basis usage](#basis-usage)
2. [Methods](#methods)
3. [Documentation](docs/readme.md)

## Basis usage

```js
const sspLib = require('@kybarg/ssp')

let eSSP = new sspLib({
  id: 0x00,
  timeout: 3000,
  fixedKey: '0123456701234567',
})

eSSP.on('READ_NOTE', result => {
  console.log('READ_NOTE', result)
})

eSSP.command('GET_SERIAL_NUMBER').then(result => {
  console.log('Serial number:', result.info.serial_number)
  return
})

const portOptions = { baudRate: 9600 }

eSSP.open('COM1', portOptions)
```

## Config values

```javascript
const options = {
  fixedKey: '123', // device internal encryption key
  encryptAllCommand: true, // should command commands also be encrypted
  id: 0, // device id in case multiple acceptors connected to the host
  timeout: 1000, // command response timeout after wich command considered failed
  commandRetries: 20, // how many time to retry before throwing error or emitting ERROR event
  pollingInterval: 300, // interval between poll messages
}
```

## Methods

All methods return Promise

- `eSSP.open('COM1')` - Connect device
- `eSSP.close()` - Disconnect device
- `eSSP.initEncryption()` - Initializing Diffie-Hellman key exchange and enable encryption
- `eSSP.enable()` - Enable device and start listen events
- `eSSP.disable()` - Disable device and stop listen events
- `eSSP.poll()` - Start/Stop polling the device
- `eSSP.command('COMMAND_NAME')` - Execute command and get answer

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
