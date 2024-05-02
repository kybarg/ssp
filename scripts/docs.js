const fs = require('node:fs')
const commands = require('../lib/static/commands.json')
const statuses = require('../lib/static/status_desc.json')
let filePath = 'docs/commands.md'

// Function to make a file empty
function makeFileEmpty() {
  fs.writeFileSync(filePath, '')
}

// Function to add a line to a file
function addLineToFile(lineToAdd) {
  fs.appendFileSync(filePath, lineToAdd + '\n', 'utf8')
}

function decimalToHex(decimal) {
  return '0x' + ('0' + decimal.toString(16)).slice(-2)
}

function convertToTitleCase(str) {
  // Replace underscores with spaces
  str = str.replace(/_/g, ' ')

  // Convert string to title case
  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

// Make the file empty
makeFileEmpty()

addLineToFile('<a name="readme-top"></a>')
addLineToFile('[Back to Documentation](readme.md)')
addLineToFile('# Commands')

const sortedCommands = Object.entries(commands).sort(([, a], [, b]) => a.code - b.code)

sortedCommands.forEach(([name], index) => {
  addLineToFile(`${index + 1}. [${convertToTitleCase(name)}](#${name})`)
})

sortedCommands.forEach(([name, rest]) => {
  const { code, encrypted, args, device, description, example } = rest

  // Add a line to the file
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

// Make the file empty
makeFileEmpty()

addLineToFile('<a name="readme-top"></a>')
addLineToFile('[Back to Documentation](readme.md)')
addLineToFile('# Events')

const sortedStatuses = Object.entries(statuses).sort(([a], [b]) => a - b)

sortedStatuses.forEach(([, { name }], index) => {
  addLineToFile(`${index + 1}. [${convertToTitleCase(name)}](#${name})`)
})

addLineToFile('')

sortedStatuses.forEach(([code, rest]) => {
  const { name, description, devices, data } = rest

  // Add a line to the file
  addLineToFile(`## ${name}`)
  addLineToFile(`| Code dec | Code hex |`)
  addLineToFile(`| --- | --- |`)
  addLineToFile(`| ${code} | ${decimalToHex(code)} |`)
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
