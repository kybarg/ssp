<a name="readme-top"></a>
[Back to Documentation](readme.md)

# Events

1. [Jam Recovery](#JAM_RECOVERY)
2. [Error During Payout](#ERROR_DURING_PAYOUT)
3. [Smart Emptying](#SMART_EMPTYING)
4. [Smart Emptied](#SMART_EMPTIED)
5. [Channel Disable](#CHANNEL_DISABLE)
6. [Initialising](#INITIALISING)
7. [Coin Mech Error](#COIN_MECH_ERROR)
8. [Emptying](#EMPTYING)
9. [Emptied](#EMPTIED)
10. [Coin Mech Jammed](#COIN_MECH_JAMMED)
11. [Coin Mech Return Pressed](#COIN_MECH_RETURN_PRESSED)
12. [Payout Out Of Service](#PAYOUT_OUT_OF_SERVICE)
13. [Note Float Removed](#NOTE_FLOAT_REMOVED)
14. [Note Float Attached](#NOTE_FLOAT_ATTACHED)
15. [Note Transfered To Stacker](#NOTE_TRANSFERED_TO_STACKER)
16. [Note Paid Into Stacker At Power-up](#NOTE_PAID_INTO_STACKER_AT_POWER-UP)
17. [Note Paid Into Store At Power-up](#NOTE_PAID_INTO_STORE_AT_POWER-UP)
18. [Note Stacking](#NOTE_STACKING)
19. [Note Dispensed At Power-up](#NOTE_DISPENSED_AT_POWER-UP)
20. [Note Held In Bezel](#NOTE_HELD_IN_BEZEL)
21. [Device Full](#DEVICE_FULL)
22. [Bar Code Ticket Acknowledge](#BAR_CODE_TICKET_ACKNOWLEDGE)
23. [Dispensed](#DISPENSED)
24. [Jammed](#JAMMED)
25. [Halted](#HALTED)
26. [Floating](#FLOATING)
27. [Floated](#FLOATED)
28. [Time Out](#TIME_OUT)
29. [Dispensing](#DISPENSING)
30. [Note Stored In Payout](#NOTE_STORED_IN_PAYOUT)
31. [Incomplete Payout](#INCOMPLETE_PAYOUT)
32. [Incomplete Float](#INCOMPLETE_FLOAT)
33. [Cashbox Paid](#CASHBOX_PAID)
34. [Coin Credit](#COIN_CREDIT)
35. [Note Path Open](#NOTE_PATH_OPEN)
36. [Note Cleared From Front](#NOTE_CLEARED_FROM_FRONT)
37. [Note Cleared To Cashbox](#NOTE_CLEARED_TO_CASHBOX)
38. [Cashbox Removed](#CASHBOX_REMOVED)
39. [Cashbox Replaced](#CASHBOX_REPLACED)
40. [Bar Code Ticket Validated](#BAR_CODE_TICKET_VALIDATED)
41. [Fraud Attempt](#FRAUD_ATTEMPT)
42. [Stacker Full](#STACKER_FULL)
43. [Disabled](#DISABLED)
44. [Unsafe Note Jam](#UNSAFE_NOTE_JAM)
45. [Safe Note Jam](#SAFE_NOTE_JAM)
46. [Note Stacked](#NOTE_STACKED)
47. [Note Rejected](#NOTE_REJECTED)
48. [Note Rejecting](#NOTE_REJECTING)
49. [Credit Note](#CREDIT_NOTE)
50. [Read Note](#READ_NOTE)
51. [Ok](#OK)
52. [Slave Reset](#SLAVE_RESET)
53. [Command Not Known](#COMMAND_NOT_KNOWN)
54. [Wrong No Parameters](#WRONG_NO_PARAMETERS)
55. [Parameter Out Of Range](#PARAMETER_OUT_OF_RANGE)
56. [Command Cannot Be Processed](#COMMAND_CANNOT_BE_PROCESSED)
57. [Software Error](#SOFTWARE_ERROR)
58. [Fail](#FAIL)
59. [Key Not Set](#KEY_NOT_SET)

## JAM_RECOVERY

| Code dec | Code hex |
| -------- | -------- |
| 176      | 0x76     |

### Devices

`SMART Payout`

### Description

The SMART Payout unit is in the process of recovering from a detected jam. This process will typically move five notes to the cash box; this is done to minimise the possibility the unit will go out of service

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## ERROR_DURING_PAYOUT

| Code dec | Code hex |
| -------- | -------- |
| 177      | 0x77     |

### Devices

`SMART Payout`

### Description

Returned if an error is detected whilst moving a note inside the SMART Payout unit. The cause of error (1 byte) indicates the source of the condition; 0x00 for note not being correctly detected as it is routed to cashbox or for payout, 0x01 if note is jammed in transport. In the case of the incorrect detection, the response to Cashbox Payout Operation Data request would report the note expected to be paid out.

### Data

#### Protocol version < 7

| Name  | Type     |
| ----- | -------- |
| error | `string` |

#### Protocol version >= 7

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |
| error                | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SMART_EMPTYING

| Code dec | Code hex |
| -------- | -------- |
| 179      | 0x79     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device is in the process of carrying out its Smart Empty command from the host. The value emptied at the poll point is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SMART_EMPTIED

| Code dec | Code hex |
| -------- | -------- |
| 180      | 0x80     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device has completed its Smart Empty command. The total amount emptied is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CHANNEL_DISABLE

| Code dec | Code hex |
| -------- | -------- |
| 181      | 0x81     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The device has had all its note channels inhibited and has become disabled for note insertion.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## INITIALISING

| Code dec | Code hex |
| -------- | -------- |
| 182      | 0x82     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`, `SMART Hopper`

### Description

This event is given only when using the Poll with ACK command. It is given when the BNV is powered up and setting its sensors and mechanisms to be ready for Note acceptance. When the event response does not contain this event, the BNV is ready to be enabled and used.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COIN_MECH_ERROR

| Code dec | Code hex |
| -------- | -------- |
| 183      | 0x83     |

### Devices

`SMART Hopper`

### Description

The attached coin mechanism has generated an error. Its code is given in the event data.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## EMPTYING

| Code dec | Code hex |
| -------- | -------- |
| 194      | 0x94     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device is in the process of emptying its content to the system cashbox in response to an Empty command.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## EMPTIED

| Code dec | Code hex |
| -------- | -------- |
| 195      | 0x95     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device has completed its Empty process in response to an Empty command from the host.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COIN_MECH_JAMMED

| Code dec | Code hex |
| -------- | -------- |
| 196      | 0x96     |

### Devices

`SMART Hopper`

### Description

The attached coin mechanism has been detected as having a jam.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COIN_MECH_RETURN_PRESSED

| Code dec | Code hex |
| -------- | -------- |
| 197      | 0x97     |

### Devices

`SMART Hopper`

### Description

The attached coin mechanism has been detected as having is reject or return button pressed.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## PAYOUT_OUT_OF_SERVICE

| Code dec | Code hex |
| -------- | -------- |
| 198      | 0x98     |

### Devices

`SMART Payout`, `NV11`

### Description

This event is given if the payout goes out of service during operation. If this event is detected after a poll, the host can send the ENABLE PAYOUT DEVICE command to determine if the payout unit comes back into service.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_FLOAT_REMOVED

| Code dec | Code hex |
| -------- | -------- |
| 199      | 0x99     |

### Devices

`NV11`

### Description

Reported when a note float unit has been detected as removed from its validator.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_FLOAT_ATTACHED

| Code dec | Code hex |
| -------- | -------- |
| 200      | 0x00     |

### Devices

`NV11`

### Description

Reported when a note float unit has been detected as removed from its validator.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_TRANSFERED_TO_STACKER

| Code dec | Code hex |
| -------- | -------- |
| 201      | 0x01     |

### Devices

`SMART Payout`, `NV11`

### Description

Reported when a note has been successfully moved from the payout store into the stacker cashbox.

### Data

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_PAID_INTO_STACKER_AT_POWER-UP

| Code dec | Code hex |
| -------- | -------- |
| 202      | 0x02     |

### Devices

`SMART Payout`, `NV11`

### Description

Reported when a note has been detected as paid into the cashbox stacker as part of the power-up procedure.

### Data

#### Protocol version >= 8

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_PAID_INTO_STORE_AT_POWER-UP

| Code dec | Code hex |
| -------- | -------- |
| 203      | 0x03     |

### Devices

`SMART Payout`, `NV11`

### Description

Reported when a note has been detected as paid into the payout store as part of the power-up procedure.

### Data

#### Protocol version >= 8

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_STACKING

| Code dec | Code hex |
| -------- | -------- |
| 204      | 0x04     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The note is being moved from the escrow position to the host exit section of the device.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_DISPENSED_AT_POWER-UP

| Code dec | Code hex |
| -------- | -------- |
| 205      | 0x05     |

### Devices

`NV11`

### Description

Reported when a note has been dispensed as part of the power-up procedure.

### Data

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_HELD_IN_BEZEL

| Code dec | Code hex |
| -------- | -------- |
| 206      | 0x06     |

### Devices

`SMART Payout`, `NV11`

### Description

Reported when a dispensing note is held in the bezel of the payout device.

### Data

#### Protocol version >= 8

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DEVICE_FULL

| Code dec | Code hex |
| -------- | -------- |
| 207      | 0x07     |

### Devices

`NV11`

### Description

This event is reported when the Note Float has reached its limit of stored notes. This event will be reported until a note is paid out or stacked.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## BAR_CODE_TICKET_ACKNOWLEDGE

| Code dec | Code hex |
| -------- | -------- |
| 209      | 0x09     |

### Devices

`NV200`, `NV201`

### Description

The bar code ticket has been passed to a safe point in the device stacker.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DISPENSED

| Code dec | Code hex |
| -------- | -------- |
| 210      | 0x10     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device has completed its pay-out request. The final value paid is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## JAMMED

| Code dec | Code hex |
| -------- | -------- |
| 213      | 0x13     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device has detected that coins are jammed in its mechanism and cannot be removed other than by manual intervention. The value paid at the jam point is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## HALTED

| Code dec | Code hex |
| -------- | -------- |
| 214      | 0x14     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

This event is given when the host has requested a halt to the device. The value paid at the point of halting is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## FLOATING

| Code dec | Code hex |
| -------- | -------- |
| 215      | 0x15     |

### Devices

`SMART Payout`, `SMART Hopper`

### Description

The device is in the process of executing a float command and the value paid to the cashbox at the poll time is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## FLOATED

| Code dec | Code hex |
| -------- | -------- |
| 216      | 0x16     |

### Devices

`SMART Payout`, `SMART Hopper`

### Description

The device has completed its float command and the final value floated to the cashbox is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## TIME_OUT

| Code dec | Code hex |
| -------- | -------- |
| 217      | 0x17     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device has been unable to complete a request. The value paid up until the time-out point is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DISPENSING

| Code dec | Code hex |
| -------- | -------- |
| 218      | 0x18     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device is in the process of paying out a requested value. The value paid at the poll is given in the vent data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_STORED_IN_PAYOUT

| Code dec | Code hex |
| -------- | -------- |
| 219      | 0x19     |

### Devices

`SMART Payout`, `NV11`

### Description

The note has been passed into the note store of the payout unit.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## INCOMPLETE_PAYOUT

| Code dec | Code hex |
| -------- | -------- |
| 220      | 0x20     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device has detected a discrepancy on power-up that the last payout request was interrupted (possibly due to a power failure). The amounts of the value paid and requested are given in the event data.

### Data

#### Protocol version < 6

| Name      | Type     |
| --------- | -------- |
| actual    | `number` |
| requested | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].actual       | `number`   |
| value[].requested    | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## INCOMPLETE_FLOAT

| Code dec | Code hex |
| -------- | -------- |
| 221      | 0x21     |

### Devices

`SMART Payout`, `SMART Hopper`, `NV11`

### Description

The device has detected a discrepancy on power-up that the last float request was interrupted (possibly due to a power failure). The amounts of the value paid and requested are given in the event data.

### Data

#### Protocol version < 6

| Name      | Type     |
| --------- | -------- |
| actual    | `number` |
| requested | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].actual       | `number`   |
| value[].requested    | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CASHBOX_PAID

| Code dec | Code hex |
| -------- | -------- |
| 222      | 0x22     |

### Devices

`SMART Hopper`

### Description

This is given at the end of a payout cycle. It shows the value of stored coins that were routed to the cashbox that were paid into the cashbox during the payout cycle.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COIN_CREDIT

| Code dec | Code hex |
| -------- | -------- |
| 223      | 0x23     |

### Devices

`SMART Hopper`

### Description

A coin has been detected as added to the system via the attached coin mechanism. The value of the coin detected is given in the event data.

### Data

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_PATH_OPEN

| Code dec | Code hex |
| -------- | -------- |
| 224      | 0x24     |

### Devices

`NV200`

### Description

The device has detected that its note transport path has been opened.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_CLEARED_FROM_FRONT

| Code dec | Code hex |
| -------- | -------- |
| 225      | 0x25     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

At power-up, a note was detected as being rejected out of the front of the device. The channel value, if known is given in the data byte.

### Data

#### All

| Name    | Type     |
| ------- | -------- |
| channel | `number` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_CLEARED_TO_CASHBOX

| Code dec | Code hex |
| -------- | -------- |
| 226      | 0x26     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

At power up, a note was detected as being moved into the stacker unit or host exit of the device. The channel number of the note is given in the data byte if known.

### Data

#### All

| Name    | Type     |
| ------- | -------- |
| channel | `number` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CASHBOX_REMOVED

| Code dec | Code hex |
| -------- | -------- |
| 227      | 0x27     |

### Devices

`BV50`, `BV100`, `NV200`, `SMART Payout`, `NV11`

### Description

A device with a detectable cashbox has detected that it has been removed.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CASHBOX_REPLACED

| Code dec | Code hex |
| -------- | -------- |
| 228      | 0x28     |

### Devices

`BV50`, `BV100`, `NV200`, `SMART Payout`, `NV11`

### Description

A device with a detectable cashbox has detected that it has been replaced.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## BAR_CODE_TICKET_VALIDATED

| Code dec | Code hex |
| -------- | -------- |
| 229      | 0x29     |

### Devices

`NV200`, `NV201`

### Description

A validated barcode ticket has been scanned and is available at the escrow point of the device.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## FRAUD_ATTEMPT

| Code dec | Code hex |
| -------- | -------- |
| 230      | 0x30     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`, `SMART Hopper`

### Description

The device has detected an attempt to tamper with the normal validation/stacking/payout process.

### Data

#### Banknote validators

| Name    | Type     |
| ------- | -------- |
| channel | `number` |

#### Protocol version < 6

| Name  | Type     |
| ----- | -------- |
| value | `number` |

#### Protocol version >= 6

| Name                 | Type       |
| -------------------- | ---------- |
| value                | `Object[]` |
| value[].value        | `number`   |
| value[].country_code | `string`   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## STACKER_FULL

| Code dec | Code hex |
| -------- | -------- |
| 231      | 0x31     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The banknote stacker unit attached to this device has been detected as at its full limit

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## DISABLED

| Code dec | Code hex |
| -------- | -------- |
| 232      | 0x32     |

### Devices

`All`

### Description

The device is not active and unavailable for normal validation functions.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## UNSAFE_NOTE_JAM

| Code dec | Code hex |
| -------- | -------- |
| 233      | 0x33     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The note is stuck in a position where the user could possibly remove it from the front of the device.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SAFE_NOTE_JAM

| Code dec | Code hex |
| -------- | -------- |
| 234      | 0x34     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The note is stuck in a position not retrievable from the front of the device (user side)

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_STACKED

| Code dec | Code hex |
| -------- | -------- |
| 235      | 0x35     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The note has exited the device on the host side or has been placed within its note stacker.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_REJECTED

| Code dec | Code hex |
| -------- | -------- |
| 236      | 0x36     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The note has been rejected from the validator and is available for the user to retrieve.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## NOTE_REJECTING

| Code dec | Code hex |
| -------- | -------- |
| 237      | 0x37     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

The note is in the process of being rejected from the validator

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CREDIT_NOTE

| Code dec | Code hex |
| -------- | -------- |
| 238      | 0x38     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

A note has passed through the device, past the point of possible recovery and the host can safely issue its credit amount. The byte value is the channel number of the note to credit.

### Data

#### All

| Name    | Type     |
| ------- | -------- |
| channel | `number` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## READ_NOTE

| Code dec | Code hex |
| -------- | -------- |
| 239      | 0x39     |

### Devices

`BV20`, `BV50`, `BV100`, `NV9USB`, `NV10USB`, `NV200`, `SMART Payout`, `NV11`

### Description

A note is in the process of being scanned by the device (byte value 0) or a valid note has been scanned and is in escrow (byte value gives the channel number)

### Data

#### All

| Name    | Type     |
| ------- | -------- |
| channel | `number` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## OK

| Code dec | Code hex |
| -------- | -------- |
| 240      | 0x40     |

### Description

Returned when a command from the host is understood and has been, or is in the process of, being executed.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SLAVE_RESET

| Code dec | Code hex |
| -------- | -------- |
| 241      | 0x41     |

### Devices

`All`

### Description

The device has undergone a power reset.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COMMAND_NOT_KNOWN

| Code dec | Code hex |
| -------- | -------- |
| 242      | 0x42     |

### Description

Returned when an invalid command is received by a peripheral.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## WRONG_NO_PARAMETERS

| Code dec | Code hex |
| -------- | -------- |
| 243      | 0x43     |

### Description

A command was received by a peripheral, but an incorrect number of parameters were received.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## PARAMETER_OUT_OF_RANGE

| Code dec | Code hex |
| -------- | -------- |
| 244      | 0x44     |

### Description

One of the parameters sent with a command is out of range.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## COMMAND_CANNOT_BE_PROCESSED

| Code dec | Code hex |
| -------- | -------- |
| 245      | 0x45     |

### Description

A command sent could not be processed at that time. E.g. sending a dispense command before the last dispense operation has completed.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## SOFTWARE_ERROR

| Code dec | Code hex |
| -------- | -------- |
| 246      | 0x46     |

### Description

Reported for errors in the execution of software e.g. Divide by zero. This may also be reported if there is a problem resulting from a failed remote firmware upgrade, in this case the firmware upgrade should be redone.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## FAIL

| Code dec | Code hex |
| -------- | -------- |
| 248      | 0x48     |

### Description

Command failure

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## KEY_NOT_SET

| Code dec | Code hex |
| -------- | -------- |
| 250      | 0x50     |

### Description

The slave is in encrypted communication mode but the encryption keys have not been negotiated.

### Data

This event has no data associated with it

<p align="right">(<a href="#readme-top">back to top</a>)</p>
