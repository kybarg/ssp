import fs from 'node:fs'
import commands from '../lib/static/commands.json'
import statuses from '../lib/static/status_desc.json'

interface CommandEntry {
  code: number
  encrypted?: boolean
  args?: Record<string, string> | false
  device?: string[]
  description?: string
  example?: string
}

interface StatusEntry {
  name: string
  description?: string
  devices?: string[]
  data?: Record<string, Record<string, string>>
}

let filePath = 'docs/commands.md'

function makeFileEmpty(): void {
  fs.writeFileSync(filePath, '')
}

function addLineToFile(lineToAdd: string): void {
  fs.appendFileSync(filePath, lineToAdd + '\n', 'utf8')
}

function decimalToHex(decimal: number): string {
  return '0x' + ('0' + decimal.toString(16)).slice(-2)
}

function convertToTitleCase(str: string): string {
  str = str.replace(/_/g, ' ')

  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

makeFileEmpty()

addLineToFile('<a name="readme-top"></a>')
addLineToFile('[Back to Documentation](readme.md)')
addLineToFile('# Commands')

const sortedCommands = Object.entries(commands as Record<string, CommandEntry>).sort(([, a], [, b]) => a.code - b.code)

sortedCommands.forEach(([name], index) => {
  addLineToFile(`${index + 1}. [${convertToTitleCase(name)}](#${name})`)
})

sortedCommands.forEach(([name, rest]) => {
  const { code, encrypted, args, device, description, example } = rest

  addLineToFile(`## ${name}`)
  addLineToFile(`| Code dec | Code hex |`)
  addLineToFile(`| --- | --- |`)
  addLineToFile(`| ${code} | ${decimalToHex(code)} |`)
  addLineToFile('')

  if (encrypted) {
    addLineToFile('> [!IMPORTANT]')
    addLineToFile('>')
    addLineToFile('> **Requires encryption**')
    addLineToFile('')
  }

  if (device) {
    addLineToFile('### Devices')
    addLineToFile(`${device.map(d => `\`${d}\``).join(', ')}`)
    addLineToFile('')
  }

  if (description) {
    addLineToFile('### Description')
    addLineToFile(description)
    addLineToFile('')
  }

  if (args) {
    addLineToFile('### Arguments')
    addLineToFile('| Name | Type |')
    addLineToFile('| --- | --- |')

    Object.entries(args).forEach(([name, value]) => {
      addLineToFile(`| ${name} | \`${value.replace(/\|/g, '\\|')}\` |`)
    })
    addLineToFile('')
  }

  addLineToFile('### Example')
  addLineToFile('```javascript')
  if (example) {
    addLineToFile(example)
  } else {
    addLineToFile(`SSP.command('${name}')`)
  }
  addLineToFile('```')
  addLineToFile('')
  addLineToFile('<p align="right">(<a href="#readme-top">back to top</a>)</p>')
  addLineToFile('')
})

filePath = 'docs/events.md'

makeFileEmpty()

addLineToFile('<a name="readme-top"></a>')
addLineToFile('[Back to Documentation](readme.md)')
addLineToFile('# Events')

const sortedStatuses = Object.entries(statuses as Record<string, StatusEntry>).sort(([a], [b]) => Number(a) - Number(b))

sortedStatuses.forEach(([, { name }], index) => {
  addLineToFile(`${index + 1}. [${convertToTitleCase(name)}](#${name})`)
})

addLineToFile('')

sortedStatuses.forEach(([code, rest]) => {
  const { name, description, devices, data } = rest

  addLineToFile(`## ${name}`)
  addLineToFile(`| Code dec | Code hex |`)
  addLineToFile(`| --- | --- |`)
  addLineToFile(`| ${code} | ${decimalToHex(Number(code))} |`)
  addLineToFile('')

  if (devices) {
    addLineToFile('### Devices')
    addLineToFile(`${devices.map(d => `\`${d}\``).join(', ')}`)
    addLineToFile('')
  }

  if (description) {
    addLineToFile('### Description')
    addLineToFile(description)
    addLineToFile('')
  }

  addLineToFile('### Data')
  if (data) {
    Object.entries(data).forEach(([title, args]) => {
      addLineToFile(`#### ${title}`)

      addLineToFile('| Name | Type |')
      addLineToFile('| --- | --- |')

      Object.entries(args).forEach(([name, value]) => {
        addLineToFile(`| ${name} | \`${value.replace(/\|/g, '\\|')}\` |`)
      })
      addLineToFile('')
    })
  } else {
    addLineToFile('This event has no data associated with it')
  }
  addLineToFile('')
  addLineToFile('<p align="right">(<a href="#readme-top">back to top</a>)</p>')
  addLineToFile('')
})
