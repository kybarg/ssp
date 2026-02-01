import SSP from './lib/index'

interface Channel {
  value: number
  country_code: string
}

const channels: Channel[] = [{ value: 0, country_code: 'XXX' }]

const serialPortConfig = {
  baudRate: 9600,
  dataBits: 8 as const,
  stopBits: 2 as const,
  parity: 'none' as const,
}

const eSSP = new SSP({
  id: 0x00,
  timeout: 1000,
  encryptAllCommand: true,
  fixedKey: '0123456701234567',
})

eSSP.on('OPEN', () => {
  console.log('Port opened!')
})

eSSP.on('CLOSE', () => {
  console.log('Port closed!')
})

eSSP.on('READ_NOTE', (result: { channel: number }) => {
  console.log('READ_NOTE', result)
  console.log(channels[result.channel])

  if (channels[result.channel].value === 500) {
    eSSP.command('REJECT_BANKNOTE')
  }
})

eSSP.on('NOTE_REJECTED', (result: unknown) => {
  console.log('NOTE_REJECTED', result)

  eSSP.command('LAST_REJECT_CODE').then(result => {
    console.log(result)
  })
})

eSSP
  .open('COM3', serialPortConfig)
  .then(() => eSSP.command('SYNC'))
  .then(() => eSSP.command('HOST_PROTOCOL_VERSION', { version: 6 }))
  .then(() => eSSP.initEncryption())
  .then(() => eSSP.command('GET_SERIAL_NUMBER'))
  .then(result => {
    console.log(eSSP.keys.encryptKey)
    console.log('SERIAL NUMBER:', result.info.serial_number)
    return
  })
  .then(() => eSSP.command('UNIT_DATA'))
  .then(() => eSSP.command('SETUP_REQUEST'))
  .then(result => {
    const expandedValues = result.info.expanded_channel_value as number[]
    const expandedCodes = result.info.expanded_channel_country_code as string[]
    for (let i = 0; i < expandedValues.length; i++) {
      channels[i + 1] = {
        value: expandedValues[i],
        country_code: expandedCodes[i],
      }
    }
    console.log('channels', channels)
    return
  })
  .then(() =>
    eSSP.command('SET_CHANNEL_INHIBITS', {
      channels: Array(channels.length).fill(1),
    }),
  )
  .then(() => eSSP.enable())
  .then(() => {
    console.log('GO!!!')
  })
  .catch(error => {
    console.log(error)
  })
