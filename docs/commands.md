<a name="readme-top"></a>
[Back to Documentation](readme.md)
# Commands
1. [Reset](#RESET)
2. [Set Channel Inhibits](#SET_CHANNEL_INHIBITS)
3. [Display On](#DISPLAY_ON)
4. [Display Off](#DISPLAY_OFF)
5. [Setup Request](#SETUP_REQUEST)
6. [Host Protocol Version](#HOST_PROTOCOL_VERSION)
7. [Poll](#POLL)
8. [Reject Banknote](#REJECT_BANKNOTE)
9. [Disable](#DISABLE)
10. [Enable](#ENABLE)
11. [Get Serial Number](#GET_SERIAL_NUMBER)
12. [Unit Data](#UNIT_DATA)
13. [Channel Value Request](#CHANNEL_VALUE_REQUEST)
14. [Channel Security Data](#CHANNEL_SECURITY_DATA)
15. [Channel Re Teach Data](#CHANNEL_RE_TEACH_DATA)
16. [Sync](#SYNC)
17. [Last Reject Code](#LAST_REJECT_CODE)
18. [Hold](#HOLD)
19. [Get Firmware Version](#GET_FIRMWARE_VERSION)
20. [Get Dataset Version](#GET_DATASET_VERSION)
21. [Get All Levels](#GET_ALL_LEVELS)
22. [Get Bar Code Reader Configuration](#GET_BAR_CODE_READER_CONFIGURATION)
23. [Set Bar Code Configuration](#SET_BAR_CODE_CONFIGURATION)
24. [Get Bar Code Inhibit Status](#GET_BAR_CODE_INHIBIT_STATUS)
25. [Set Bar Code Inhibit Status](#SET_BAR_CODE_INHIBIT_STATUS)
26. [Get Bar Code Data](#GET_BAR_CODE_DATA)
27. [Set Refill Mode](#SET_REFILL_MODE)
28. [Payout Amount](#PAYOUT_AMOUNT)
29. [Set Denomination Level](#SET_DENOMINATION_LEVEL)
30. [Get Denomination Level](#GET_DENOMINATION_LEVEL)
31. [Communication Pass Through](#COMMUNICATION_PASS_THROUGH)
32. [Halt Payout](#HALT_PAYOUT)
33. [Set Denomination Route](#SET_DENOMINATION_ROUTE)
34. [Get Denomination Route](#GET_DENOMINATION_ROUTE)
35. [Float Amount](#FLOAT_AMOUNT)
36. [Get Minimum Payout](#GET_MINIMUM_PAYOUT)
37. [Empty All](#EMPTY_ALL)
38. [Set Coin Mech Inhibits](#SET_COIN_MECH_INHIBITS)
39. [Get Note Positions](#GET_NOTE_POSITIONS)
40. [Payout Note](#PAYOUT_NOTE)
41. [Stack Note](#STACK_NOTE)
42. [Float By Denomination](#FLOAT_BY_DENOMINATION)
43. [Set Value Reporting Type](#SET_VALUE_REPORTING_TYPE)
44. [Payout By Denomination](#PAYOUT_BY_DENOMINATION)
45. [Set Coin Mech Global Inhibit](#SET_COIN_MECH_GLOBAL_INHIBIT)
46. [Set Generator](#SET_GENERATOR)
47. [Set Modulus](#SET_MODULUS)
48. [Request Key Exchange](#REQUEST_KEY_EXCHANGE)
49. [Set Baud Rate](#SET_BAUD_RATE)
50. [Get Build Revision](#GET_BUILD_REVISION)
51. [Set Hopper Options](#SET_HOPPER_OPTIONS)
52. [Get Hopper Options](#GET_HOPPER_OPTIONS)
53. [Smart Empty](#SMART_EMPTY)
54. [Cashbox Payout Operation Data](#CASHBOX_PAYOUT_OPERATION_DATA)
55. [Configure Bezel](#CONFIGURE_BEZEL)
56. [Poll With Ack](#POLL_WITH_ACK)
57. [Event Ack](#EVENT_ACK)
58. [Get Counters](#GET_COUNTERS)
59. [Reset Counters](#RESET_COUNTERS)
60. [Coin Mech Options](#COIN_MECH_OPTIONS)
61. [Disable Payout Device](#DISABLE_PAYOUT_DEVICE)
62. [Enable Payout Device](#ENABLE_PAYOUT_DEVICE)
63. [Set Fixed Encryption Key](#SET_FIXED_ENCRYPTION_KEY)
64. [Reset Fixed Encryption Key](#RESET_FIXED_ENCRYPTION_KEY)
## RESET
| Code dec | Code hex |
| --- | --- |
| 1 | 0x01 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
Command to instruct the slave to perform a hard reset at any point within its operational status.

### Example
```javascript
SSP.command('RESET')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_CHANNEL_INHIBITS
| Code dec | Code hex |
| --- | --- |
| 2 | 0x02 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
Variable length command, used to control which channels are enabled. The command byte is followed by 2 data bytes, these bytes are combined to create the INHIBIT_REGISTER, each bit represents the state of a channel (LSB= channel 1, 1=enabled, 0=disabled). At power up all channels are inhibited and the validator is disabled.

### Arguments
| Name | Type |
| --- | --- |
| channels | `number[]` |

### Example
```javascript
SSP.command('SET_CHANNEL_INHIBITS', {channels:[1,1,1,1,1,0,0,0]})
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DISPLAY_ON
| Code dec | Code hex |
| --- | --- |
| 3 | 0x03 |

### Devices
`NV9USB`, `NV10USB`, `NV200`, `NV11`

### Description
Use this command to re-enabled a disabled bezel illumination function (using the Display Off command). The Bezel will only be illuminated when the device is enabled even if this command is sent.

### Example
```javascript
SSP.command('DISPLAY_ON')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DISPLAY_OFF
| Code dec | Code hex |
| --- | --- |
| 4 | 0x04 |

### Devices
`NV9USB`, `NV10USB`, `NV200`, `NV11`

### Description
This command will force the device bezel to not be illuminated even if the device is enabled.

### Example
```javascript
SSP.command('DISPLAY_OFF')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SETUP_REQUEST
| Code dec | Code hex |
| --- | --- |
| 5 | 0x05 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `NV11`

### Description
The device responds with an array of data the format of which depends upon the device, the dataset installed and the protocol version set.

### Example
```javascript
SSP.command('SETUP_REQUEST')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## HOST_PROTOCOL_VERSION
| Code dec | Code hex |
| --- | --- |
| 6 | 0x06 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
Dual byte command, the first byte is the command; the second byte is the version of the protocol that is implemented on the host. So for example, to enable events on BNV to protocol version 6, send 06, 06. The device will respond with OK if the device supports version 6, or FAIL (0xF8) if it does not.

### Arguments
| Name | Type |
| --- | --- |
| version | `number` |

### Example
```javascript
SSP.command('HOST_PROTOCOL_VERSION', { version: 6 })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## POLL
| Code dec | Code hex |
| --- | --- |
| 7 | 0x07 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
The poll command returns the list of events that have occurred within the device since the last poll. The format of the events depends on the protocol version set within the device. Note that more than one event can occur within a poll response so ensure that the full return array is scanned.

### Example
```javascript
SSP.command('POLL')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## REJECT_BANKNOTE
| Code dec | Code hex |
| --- | --- |
| 8 | 0x08 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
A command to reject a note held in escrow in the banknote validator. For devices apart form NV11; if there is no note in escrow to be rejected, the device replies with COMMAND CANNOT BE PROCESSED (0xF5).

### Example
```javascript
SSP.command('REJECT_BANKNOTE')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DISABLE
| Code dec | Code hex |
| --- | --- |
| 9 | 0x09 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `NV11`

### Description
The peripheral will switch to its disabled state, it will not execute any more commands or perform any actions until enabled, any poll commands will report disabled.

### Example
```javascript
SSP.command('DISABLE')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## ENABLE
| Code dec | Code hex |
| --- | --- |
| 10 | 0x0a |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `NV11`

### Description
Send this command to enable a disabled device.

### Example
```javascript
SSP.command('ENABLE')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_SERIAL_NUMBER
| Code dec | Code hex |
| --- | --- |
| 12 | 0x0c |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
This command returns a 4-byte big endian array representing the unique factory programmed serial number of the device.

### Example
```javascript
SSP.command('GET_SERIAL_NUMBER')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## UNIT_DATA
| Code dec | Code hex |
| --- | --- |
| 13 | 0x0d |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
Returns, Unit type (1 Byte integer), Firmware Version (4 bytes ASCII string), Country Code (3 Bytes ASCII string), Value Multiplier (3 bytes integer), Protocol Version (1 Byte, integer)

### Example
```javascript
SSP.command('UNIT_DATA')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CHANNEL_VALUE_REQUEST
| Code dec | Code hex |
| --- | --- |
| 14 | 0x0e |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
Returns channel value data for a banknote validator. Formatted as: byte 0 - the highest channel used the a value byte representing each of the denomination values. The real value is obtained by multiplying by the value multiplier. If the validator is greater than or equal to protocol version 6 then the channel values response will be given as: Highest Channel, Value Per Channel (0 for expanded values),3 Byte ASCI country code for each channel, 4- byte Full channel Value for each channel.

### Example
```javascript
SSP.command('CHANNEL_VALUE_REQUEST')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CHANNEL_SECURITY_DATA
| Code dec | Code hex |
| --- | --- |
| 15 | 0x0f |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
Command which returns a number of channels byte (the highest channel used) and then 1 to n bytes which give the security of each channel up to the highest one, a zero indicates that the channel is not implemented. (1 = low, 2 = std, 3 = high, 4 = inhibited).

### Example
```javascript
SSP.command('CHANNEL_SECURITY_DATA')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CHANNEL_RE_TEACH_DATA
| Code dec | Code hex |
| --- | --- |
| 16 | 0x10 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
This is a vestigial command and may be deprecated in future versions. Do not use. If it is supported in a device it will return all zeros.

### Example
```javascript
SSP.command('CHANNEL_RE_TEACH_DATA')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SYNC
| Code dec | Code hex |
| --- | --- |
| 17 | 0x11 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
A command to establish communications with a slave device. A Sync command resets the seq bit of the packet so that the slave device expects the next seq bit to be 0. The host then sets its next seq bit to 0 and the seq sequence is synchronised.

### Example
```javascript
SSP.command('SYNC')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## LAST_REJECT_CODE
| Code dec | Code hex |
| --- | --- |
| 23 | 0x17 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
Returns a single byte that indicates the reason for the last banknote reject. The codes are shown in the table below. Specifics of note validation are not shown to protect integrity of manufacturers security.

### Example
```javascript
SSP.command('LAST_REJECT_CODE')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## HOLD
| Code dec | Code hex |
| --- | --- |
| 24 | 0x18 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
This command may be sent to BNV when Note Read has changed from 0 to >0 (valid note seen) if the user does not wish to accept the note with the next command. This command will also reset the 10-second time-out period after which a note held would be rejected automatically, so it should be sent before this time-out if an escrow function is required. If there is no note in escrow to hold, the device will reply with COMMAND CANNOT BE PROCESSED (0xF5)

### Example
```javascript
SSP.command('HOLD')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_FIRMWARE_VERSION
| Code dec | Code hex |
| --- | --- |
| 32 | 0x20 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `NV11`

### Description
Returns the full firmware version ascii data array for this device.

### Example
```javascript
SSP.command('GET_FIRMWARE_VERSION')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_DATASET_VERSION
| Code dec | Code hex |
| --- | --- |
| 33 | 0x21 |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `NV11`

### Description
Returns a string of ascii codes giving the full dataset version of the device.

### Example
```javascript
SSP.command('GET_DATASET_VERSION')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_ALL_LEVELS
| Code dec | Code hex |
| --- | --- |
| 34 | 0x22 |

### Devices
`SMART Hopper`, `SMART Payout`

### Description
Use this command to return all the stored levels of denominations in the device (including those at zero level). This gives a faster response than sending each individual denomination level request.

### Example
```javascript
SSP.command('GET_ALL_LEVELS')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_BAR_CODE_READER_CONFIGURATION
| Code dec | Code hex |
| --- | --- |
| 35 | 0x23 |

### Devices
`NV9USB`, `NV200`

### Description
Returns the set-up data for the device bar code readers.

### Example
```javascript
SSP.command('GET_BAR_CODE_READER_CONFIGURATION')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_BAR_CODE_CONFIGURATION
| Code dec | Code hex |
| --- | --- |
| 36 | 0x24 |

### Devices
`NV9USB`, `NV200`

### Description
This command allows the host to set-up the bar code reader(s) configuration on the device. 3 bytes of data define the configuration. In this example we enable both readers with format interleaved 1 of 5 for 18 characters.

### Arguments
| Name | Type |
| --- | --- |
| enable | `none\|top\|bottom\|both` |
| numChar | `number // min:6 max:24` |

### Example
```javascript
SSP.command('SET_BAR_CODE_CONFIGURATION', {enable: 'top', numChar: 6})
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_BAR_CODE_INHIBIT_STATUS
| Code dec | Code hex |
| --- | --- |
| 37 | 0x25 |

### Devices
`NV9USB`, `NV200`

### Description
Command to return the current bar code/currency inhibit status.

### Example
```javascript
SSP.command('GET_BAR_CODE_INHIBIT_STATUS')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_BAR_CODE_INHIBIT_STATUS
| Code dec | Code hex |
| --- | --- |
| 38 | 0x26 |

### Devices
`NV9USB`, `NV200`

### Description
Sets up the bar code inhibit status register. A single data byte representing a bit register is sent. Bit 0 is Currency read enable (0 = enable, 1= disable) Bit 1 is the Bar code enable (0 = enable, 1 = disable). All other bits are not used and set to 1. This example shows a request to a device to have currency enabled, bar code enabled.

### Arguments
| Name | Type |
| --- | --- |
| currencyRead | `boolean` |
| barCode | `boolean` |

### Example
```javascript
SSP.command('SET_BAR_CODE_INHIBIT_STATUS',{ currencyRead: true, barCode: true })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_BAR_CODE_DATA
| Code dec | Code hex |
| --- | --- |
| 39 | 0x27 |

### Devices
`NV9USB`, `NV200`

### Description
Command to obtain last valid bar code ticket data, send in response to a Bar Code Ticket Validated event. This command will return a variable length data steam, a generic response (OK) followed by a status byte, a bar code data length byte, then a stream of bytes of the ticket data in ASCII.

### Example
```javascript
SSP.command('GET_BAR_CODE_DATA')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_REFILL_MODE
| Code dec | Code hex |
| --- | --- |
| 48 | 0x30 |

### Devices
`SMART Payout`

### Description
A command sequence to set or reset the facility for the payout to reject notes that are routed to the payout store but the firmware determines that they are un-suitable for storage. In default mode, they would be rerouted to the stacker. In refill mode they will be rejected from the front of the NV200.

### Arguments
| Name | Type |
| --- | --- |
| mode | `(on\|of\|get)` |

### Example
```javascript
SSP.command('SET_REFILL_MODE', { mode: 'on' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## PAYOUT_AMOUNT
| Code dec | Code hex |
| --- | --- |
| 51 | 0x33 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`

### Description
A command to set the monetary value to be paid by the payout unit. Using protocol version 6, the host also sends a pre-test option byte (TEST_PAYOUT_AMOUT 0x19, PAYOUT_AMOUNT 0x58), which will determine if the command amount is tested or paid out. This is useful for multi-payout systems so that the ability to pay a split down amount can be tested before committing to actual payout.

### Arguments
| Name | Type |
| --- | --- |
| test | `boolean` |
| amount | `number` |
| country_code | `string` |

### Example
```javascript
SSP.command('PAYOUT_AMOUNT', { test: true, amount: 500, country_code: 'EUR' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_DENOMINATION_LEVEL
| Code dec | Code hex |
| --- | --- |
| 52 | 0x34 |

### Devices
`SMART Hopper`

### Description
A command to increment the level of coins of a denomination stored in the hopper. The command is formatted with the command byte first, amount of coins to add as a 2-byte little endian, the value of coin as 2-byte little endian and (if using protocol version 6) the country code of the coin as 3 byte ASCII. The level of coins for a denomination can be set to zero by sending a zero level for that value. Note that protocol 6 version commands have been expanded to use a 4-byte coin value. The command data is formatted as byte 0 and byte 1 give the number of coins to add. In protocol version 5, the denomination is then sent as a two byte value. In protocol version greater than 5, the denomination is sent as 4 byte value plus 3 bytes ascii country code. In this example we want to increase the level of .50c coin by 20 using protocol version 5.

### Arguments
| Name | Type |
| --- | --- |
| value | `number` |
| denomination | `number` |
| country_code | `string` |

### Example
```javascript
SSP.command('SET_DENOMINATION_LEVEL', { value: 12, denomination: 100, country_code: 'EUR' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_DENOMINATION_LEVEL
| Code dec | Code hex |
| --- | --- |
| 53 | 0x35 |

### Devices
`SMART Hopper`, `SMART Payout`

### Description
This command returns the level of a denomination stored in a payout device as a 2 byte value. In protocol versions greater or equal to 6, the host adds a 3 byte ascii country code to give mulit-currency functionality. Send the requested denomination to find its level. In this case a request to find the amount of 0.10c coins in protocol version 5.

### Arguments
| Name | Type |
| --- | --- |
| amount | `number` |
| country_code | `string` |

### Example
```javascript
SSP.command('GET_DENOMINATION_LEVEL', { amount: 500, country_code: 'EUR' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COMMUNICATION_PASS_THROUGH
| Code dec | Code hex |
| --- | --- |
| 55 | 0x37 |

### Devices
`SMART Hopper`

### Description
Used with SMART Hopper only. This command sets USB pass through mode. SMART Hopper then works only as USB to serial converter to allow direct communication (firmware/dataset update) with devices connected to SMART Hopper UARTS. This command was implemented in firmware versions greater or equal to 6.16.

### Example
```javascript
SSP.command('COMMUNICATION_PASS_THROUGH')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## HALT_PAYOUT
| Code dec | Code hex |
| --- | --- |
| 56 | 0x38 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`

### Description
A command to stop the execution of an existing payout. The device will stop payout at the earliest convenient place and generate a Halted event giving the value paid up to that point.

### Example
```javascript
SSP.command('HALT_PAYOUT')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_DENOMINATION_ROUTE
| Code dec | Code hex |
| --- | --- |
| 59 | 0x3b |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
This command will configure the denomination to be either routed to the cashbox on detection or stored to be made available for later possible payout.

### Arguments
| Name | Type |
| --- | --- |
| route | `payout\|cashbox` |
| value | `number` |
| country_code | `string` |
| isHopper | `boolean` |

### Example
```javascript
SSP.command('SET_DENOMINATION_ROUTE', { route: 'payout', value: 10, country_code: 'EUR', isHopper: false })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_DENOMINATION_ROUTE
| Code dec | Code hex |
| --- | --- |
| 60 | 0x3c |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
This command allows the host to determine the route of a denomination. Note protocol versions: For protocol versions less than 6 a value only data array is sent. For protocol version greater or equal to 6, a 3 byte country code is also sent to allow multi-currency functionality to the payout. Please note that there exists a difference in the data format between SMART Payout and SMART Hopper for protocol versions less than 6. In these protocol versions the value was determined by a 2 byte array rather than 4 byte array For NV11 devices the host must send the required note value in the same form that the device is set to report by (see Set Value Reporting Type command).

### Arguments
| Name | Type |
| --- | --- |
| value | `number` |
| country_code | `string` |
| isHopper | `boolean` |

### Example
```javascript
SSP.command('GET_DENOMINATION_ROUTE', { value: 500, country_code: 'EUR', isHopper: false })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## FLOAT_AMOUNT
| Code dec | Code hex |
| --- | --- |
| 61 | 0x3d |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`

### Description
A command to float the hopper unit to leave a requested value of money, with a requested minimum possible payout level. All monies not required to meet float value are routed to cashbox. Using protocol version 6, the host also sends a pre-test option byte (TEST_FLOAT_AMOUT 0x19, FLOAT_AMOUNT 0x58), which will determine if the command amount is tested or floated. This is useful for multi-payout systems so that the ability to pay a split down amount can be tested before committing to actual float.

### Arguments
| Name | Type |
| --- | --- |
| test | `boolean` |
| min_possible_payout | `number` |
| amount | `number` |
| country_code | `string` |

### Example
```javascript
SSP.command('FLOAT_AMOUNT', { test: true, min_possible_payout: 50, amount: 10000, country_code: 'EUR' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_MINIMUM_PAYOUT
| Code dec | Code hex |
| --- | --- |
| 62 | 0x3e |

### Devices
`SMART Hopper`, `SMART Payout`

### Description
A command to request the minimum possible payout amount that this device can provide

### Example
```javascript
SSP.command('GET_MINIMUM_PAYOUT')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## EMPTY_ALL
| Code dec | Code hex |
| --- | --- |
| 63 | 0x3f |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
This command will direct all stored monies to the cash box without reporting any value and reset all the stored counters to zero. See Smart Empty command to record the value emptied.

### Example
```javascript
SSP.command('EMPTY_ALL')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_COIN_MECH_INHIBITS
| Code dec | Code hex |
| --- | --- |
| 64 | 0x40 |

### Devices
`SMART Hopper`

### Description
This command is used to enable or disable acceptance of individual coin values from a coin acceptor connected to the hopper.

### Arguments
| Name | Type |
| --- | --- |
| inhibited | `boolean` |
| amount | `number` |
| country_code | `string` |

### Example
```javascript
SSP.command('SET_COIN_MECH_INHIBITS', { inhibited: false, amount: 50, country_code: 'EUR' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_NOTE_POSITIONS
| Code dec | Code hex |
| --- | --- |
| 65 | 0x41 |

### Devices
`NV11`

### Description
This command will return the number of notes in the Note Float and the value in each position. The way the value is reported is specified by the Set Reporting Type command. The value can be reported by its value or by the channel number of the bill validator. The first note in the table is the first note that was paid into the Note Float. The Note Float is a LIFO system, so the note that is last in the table is the only one that is available to be paid out or moved into the stacker.

### Example
```javascript
SSP.command('GET_NOTE_POSITIONS')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## PAYOUT_NOTE
| Code dec | Code hex |
| --- | --- |
| 66 | 0x42 |

### Devices
`NV11`

### Description
The Note Float will payout the last note that was stored. This is the note that is in the highest position in the table returned by the Get Note Positions Command. If the payout is possible the Note Float will reply with generic response OK. If the payout is not possible the reply will be generic response COMMAND CANNOT BE PROCESSED, followed by an error code shown in the table below

### Example
```javascript
SSP.command('PAYOUT_NOTE')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## STACK_NOTE
| Code dec | Code hex |
| --- | --- |
| 67 | 0x43 |

### Devices
`NV11`

### Description
The Note Float will stack the last note that was stored. This is the note that is in the highest position in the table returned by the Get Note Positions Command. If the stack operation is possible the Note Float will reply with generic response OK. If the stack is not possible the reply will be generic response command cannot be processed, followed by an error code as shown in the table.

### Example
```javascript
SSP.command('STACK_NOTE')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## FLOAT_BY_DENOMINATION
| Code dec | Code hex |
| --- | --- |
| 68 | 0x44 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`

### Description
A command to float (leave in device) the requested quantity of individual denominations. The quantities of denominations to leave are sent as a 2 byte little endian array; the money values as 4-byte little endian array and the country code as a 3-byte ASCII array. The host also adds an option byte to the end of the command array (TEST_PAYOUT_AMOUT 0x19 or PAYOUT_AMOUNT 0x58). This will allow a pre-test of the ability to float to the requested levels before actual float executes.

### Arguments
| Name | Type |
| --- | --- |
| test | `boolean` |
| value | `Object[]` |
| value[].number | `number` |
| value[].denomination | `number` |
| value[].country_code | `string` |

### Example
```javascript
SSP.command('FLOAT_BY_DENOMINATION', { value: [{ number: 4, denomination: 100, country_code: 'EUR' }, { number: 5, denomination: 10, country_code: 'EUR' }], test: false })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_VALUE_REPORTING_TYPE
| Code dec | Code hex |
| --- | --- |
| 69 | 0x45 |

### Devices
`NV11`

### Description
This will set the method of reporting values of notes. There are two options, by a four-byte value of the note or by the channel number of the value from the banknote validator. If the channel number is used then the actual value must be determined using the data from the Validator command Unit Data. The default operation is by 4-byte value. Send 0x00 to set Report by value, 0x01 to set Report By Channel.

### Arguments
| Name | Type |
| --- | --- |
| reportBy | `value\|channel` |

### Example
```javascript
SSP.command('SET_VALUE_REPORTING_TYPE', { reportBy: 'channel' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## PAYOUT_BY_DENOMINATION
| Code dec | Code hex |
| --- | --- |
| 70 | 0x46 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`

### Description
A command to payout the requested quantity of individual denominations. The quantities of denominations to pay are sent as a 2 byte little endian array; the money values as 4-byte little endian array and the country code as a 3-byte ASCII array. The host also adds an option byte to the end of the command array (TEST_PAYOUT_AMOUT 0x19 or PAYOUT_AMOUNT 0x58). This will allow a pre-test of the ability to payout the requested levels before actual payout executes.

### Arguments
| Name | Type |
| --- | --- |
| test | `boolean` |
| value | `Object[]` |
| value[].number | `number` |
| value[].denomination | `number` |
| value[].country_code | `string` |

### Example
```javascript
SSP.command('PAYOUT_BY_DENOMINATION', { value: [{ number: 4, denomination: 100, country_code: 'EUR' }, { number: 5, denomination: 10, country_code: 'EUR' }], test: false })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_COIN_MECH_GLOBAL_INHIBIT
| Code dec | Code hex |
| --- | --- |
| 73 | 0x49 |

### Devices
`SMART Hopper`

### Description
This command allows the host to enable/disable the attached coin mech in one command rather than by each individual value with previous firmware versions. Send this command and one Mode data byte: Data byte = 0x00 - mech disabled. Date byte = 0x01 - mech enabled.

### Arguments
| Name | Type |
| --- | --- |
| enable | `boolean` |

### Example
```javascript
SSP.command('SET_COIN_MECH_GLOBAL_INHIBIT', {enable:true})
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_GENERATOR
| Code dec | Code hex |
| --- | --- |
| 74 | 0x4a |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
Eight data bytes are a 64 bit number representing the Generator this must be a 64bit prime number. The slave will reply with OK or PARAMETER_OUT_OF_RANGE if the number is not prime.

### Arguments
| Name | Type |
| --- | --- |
| key | `number` |

### Example
```javascript
SSP.command('SET_GENERATOR', { key: 982451653 })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_MODULUS
| Code dec | Code hex |
| --- | --- |
| 75 | 0x4b |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
Eight data bytes are a 64 bit number representing the modulus this must be a 64 bit prime number. The slave will reply with OK or PARAMETER_OUT_OF_RANGE if the number is not prime.

### Arguments
| Name | Type |
| --- | --- |
| key | `number` |

### Example
```javascript
SSP.command('SET_GENERATOR', { key: 982451653 })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## REQUEST_KEY_EXCHANGE
| Code dec | Code hex |
| --- | --- |
| 76 | 0x4c |

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
The eight data bytes are a 64 bit number representing the Host intermediate key. If the Generator and Modulus have been set the slave will calculate the reply with the generic response and eight data bytes representing the slave intermediate key. The host and slave will then calculate the key. If Generator and Modulus are not set then the slave will reply FAIL.

### Arguments
| Name | Type |
| --- | --- |
| key | `number` |

### Example
```javascript
SSP.command('SET_GENERATOR', { key: 982451653 })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_BAUD_RATE
| Code dec | Code hex |
| --- | --- |
| 77 | 0x4d |

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
This command has two data bytes to allow communication speed to be set on a device. The first byte is the speed to change to (see table below).

### Arguments
| Name | Type |
| --- | --- |
| baudrate | `9600\|38400\|115200` |
| reset_to_default_on_reset | `boolean` |

### Example
```javascript
SSP.command('SET_BAUD_RATE', { baudrate: 9600, reset_to_default_on_reset: true })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_BUILD_REVISION
| Code dec | Code hex |
| --- | --- |
| 79 | 0x4f |

### Devices
`NV200`, `SMART Hopper`, `SMART Payout`, `NV11`

### Description
A command to return the build revision information of a device. The command returns 3 bytes of information representing the build of the product. Byte 0 is the product type, next two bytes make up the revision number(0-65536). For NV200 and NV9USB, the type byte is 0, for Note Float, byte is 3 and for SMART Payout the byte is 6.

### Example
```javascript
SSP.command('GET_BUILD_REVISION')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_HOPPER_OPTIONS
| Code dec | Code hex |
| --- | --- |
| 80 | 0x50 |

### Devices
`SMART Hopper`

### Description
The host can set the following options for the SMART Hopper. These options do not persist in memory and after a reset they will go to their default values. This command is valid only when using protocol version 6 or greater.

### Arguments
| Name | Type |
| --- | --- |
| payMode | `0\|1` |
| levelCheck | `boolean` |
| motorSpeed | `0\|1` |
| cashBoxPayActive | `boolean` |

### Example
```javascript
SSP.command('SET_HOPPER_OPTIONS', { payMode: 0, levelCheck: false, motorSpeed: 1, cashBoxPayActive: false })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_HOPPER_OPTIONS
| Code dec | Code hex |
| --- | --- |
| 81 | 0x51 |

### Devices
`SMART Hopper`

### Description
This command returns 2 option register bytes described in Set Hopper Options command.

### Example
```javascript
SSP.command('GET_HOPPER_OPTIONS')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SMART_EMPTY
| Code dec | Code hex |
| --- | --- |
| 82 | 0x52 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
Empties payout device of contents, maintaining a count of value emptied. The current total value emptied is given is response to a poll command. All coin counters will be set to 0 after running this command. Use Cashbox Payout Operation Data command to retrieve a breakdown of the denomination routed to the cashbox through this operation.

### Example
```javascript
SSP.command('SMART_EMPTY')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CASHBOX_PAYOUT_OPERATION_DATA
| Code dec | Code hex |
| --- | --- |
| 83 | 0x53 |

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
Can be sent at the end of a SMART Empty, float or dispense operation. Returns the amount emptied to cashbox from the payout in the last dispense, float or empty command. The quantity of denominations in the response is sent as a 2 byte little endian array; the note values as 4-byte little endian array and the country code as a 3-byte ASCII array. Each denomination in the dataset will be reported, even if 0 coins of that denomination are emptied. As money is emptied from the device, the value is checked. An additional 4 bytes will be added to the response giving a count of object that could not be validated whilst performing the operation. The response is formatted as follows: byteParameter byte 0The number denominations (n) in this response (max 20) byte 1 to byte 1 + (9*n)The individual denomination level (see description below) byte 1 to byte 1 + (9*n) + 1 to byte 1 to byte 1 + (9*n) + 4 The number of un-validated objects moved. Individual level requests: byte 0 and byte 1 number of coins of this denomination moved to cashbox in operation byte 2 to byte 5 The denomination value byte 6 to byte 8 The ascii denomination country code

### Example
```javascript
SSP.command('CASHBOX_PAYOUT_OPERATION_DATA')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CONFIGURE_BEZEL
| Code dec | Code hex |
| --- | --- |
| 84 | 0x54 |

### Devices
`NV200`

### Description
This command allows the host to configure a supported BNV bezel. If the bezel is not supported the command will return generic response COMMAND NOT KNOWN 0xF2.

### Arguments
| Name | Type |
| --- | --- |
| RGB | `hex color` |
| volatile | `boolean` |

### Example
```javascript
SSP.command('CONFIGURE_BEZEL', { RGB: 'FF0000', volatile: false })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## POLL_WITH_ACK
| Code dec | Code hex |
| --- | --- |
| 86 | 0x56 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `NV11`

### Description
A command that behaves in the same way as the Poll command but with this command, the specified events (see table below) will need to be acknowledged by the host using the EVENT ACK command (0x56). The events will repeat until the EVENT ACK command is sent and the BNV will not allow any further note actions until the event has been cleared by the EVENT ACK command. If this command is not supported by the slave device, then generic response 0xF2 will be returned and standard poll command (0x07) will have to be used.

### Example
```javascript
SSP.command('POLL_WITH_ACK')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## EVENT_ACK
| Code dec | Code hex |
| --- | --- |
| 87 | 0x57 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`NV9USB`, `NV10USB`, `BV20`, `BV50`, `BV100`, `NV200`, `SMART Hopper`, `NV11`

### Description
This command will clear a repeating Poll ACK response and allow further note operations.

### Example
```javascript
SSP.command('EVENT_ACK')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## GET_COUNTERS
| Code dec | Code hex |
| --- | --- |
| 88 | 0x58 |

### Devices
`NV9USB`, `SMART Payout`, `NV11`

### Description
A command to return a global note activity counter set for the slave device. The response is formatted as in the table below and the counter values are persistent in memory after a power down- power up cycle. These counters are note set independent and will wrap to zero and begin again if their maximum value is reached. Each counter is made up of 4 bytes of data giving a max value of 4294967295.

### Example
```javascript
SSP.command('GET_COUNTERS')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## RESET_COUNTERS
| Code dec | Code hex |
| --- | --- |
| 89 | 0x59 |

### Devices
`NV9USB`, `SMART Payout`, `NV11`

### Description
Resets the note activity counters described in Get Counters command to all zero values.

### Example
```javascript
SSP.command('RESET_COUNTERS')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COIN_MECH_OPTIONS
| Code dec | Code hex |
| --- | --- |
| 90 | 0x5a |

### Devices
`SMART Hopper`

### Description
The host can set the following options for the SMART Hopper. These options do not persist in memory and after a reset they will go to their default values.

### Arguments
| Name | Type |
| --- | --- |
| ccTalk | `boolean` |

### Example
```javascript
SSP.command('COIN_MECH_OPTIONS')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DISABLE_PAYOUT_DEVICE
| Code dec | Code hex |
| --- | --- |
| 91 | 0x5b |

### Devices
`SMART Payout`, `NV11`

### Description
All accepted notes will be routed to the stacker and payout commands will not be accepted.

### Example
```javascript
SSP.command('DISABLE_PAYOUT_DEVICE')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## ENABLE_PAYOUT_DEVICE
| Code dec | Code hex |
| --- | --- |
| 92 | 0x5c |

### Devices
`SMART Payout`, `NV11`

### Description
A command to enable the attached payout device for storing/paying out notes. A successful enable will return OK, If there is a problem the reply will be generic response COMMAND_CANNOT_BE_PROCESSED, followed by an error code.

### Arguments
| Name | Type |
| --- | --- |
| GIVE_VALUE_ON_STORED | `boolean` |
| NO_HOLD_NOTE_ON_PAYOUT | `boolean` |
| REQUIRE_FULL_STARTUP | `boolean` |
| OPTIMISE_FOR_PAYIN_SPEED | `boolean` |

### Example
```javascript
SSP.command('ENABLE_PAYOUT_DEVICE', { GIVE_VALUE_ON_STORED: true, NO_HOLD_NOTE_ON_PAYOUT: true })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SET_FIXED_ENCRYPTION_KEY
| Code dec | Code hex |
| --- | --- |
| 96 | 0x60 |

> [!IMPORTANT]
>
> **Requires encryption**

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
A command to allow the host to change the fixed part of the eSSP key. The eight data bytes are a 64 bit number representing the fixed part of the key. This command must be encrypted.

### Arguments
| Name | Type |
| --- | --- |
| fixedKey | `string` |

### Example
```javascript
SSP.command('SET_FIXED_ENCRYPTION_KEY', { fixedKey: '0123456701234567' })
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## RESET_FIXED_ENCRYPTION_KEY
| Code dec | Code hex |
| --- | --- |
| 97 | 0x61 |

### Devices
`SMART Hopper`, `SMART Payout`, `NV11`

### Description
Resets the fixed encryption key to the device default. The device may have extra security requirements before it will accept this command (e.g. The Hopper must be empty) if these requirements are not met, the device will reply with Command Cannot be Processed. If successful, the device will reply OK, then reset. When it starts up the fixed key will be the default.

### Example
```javascript
SSP.command('RESET_FIXED_ENCRYPTION_KEY')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

