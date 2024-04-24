<a name="readme-top"></a>

# @kybarg/ssp

Node.JS implemenation of Encrypted Smiley ® Secure Protocol (eSSP, SSP)

**Supported devices:** NV9USB, NV10USB, BV20, BV50, BV100, NV200, NV200 Spectral, SMART Hopper, SMART Payout, NV11, NV22

> [!WARNING]
> **NV11** is not fully tested and supported. Maintainer is required.

## Table of Contents

1. [Basis usage](#basis-usage)
2. [Methods](#methods)
3. [Commands](docs/commands.md)
4. [Events](docs/events.md)

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
