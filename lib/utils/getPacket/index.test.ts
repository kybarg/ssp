import crypto from 'node:crypto'
import { getPacket } from '.'
import { argsToByte } from '../argsToByte/argsToByte'

describe('getPacket', () => {
  let originalRandomBytes: typeof crypto.randomBytes

  beforeEach(() => {
    originalRandomBytes = crypto.randomBytes
  })

  afterEach(() => {
    crypto.randomBytes = originalRandomBytes
  })

  const key = Buffer.from('674523016745230137dd000000000000', 'hex')

  test('throws error when args are missing for a command that requires them', () => {
    const args = Buffer.from([])
    const sequence = 1

    expect(() => getPacket('SET_CHANNEL_INHIBITS', args, sequence)).toThrow('Command requires arguments')
  })

  test('generates packet with encrypted data when encryption key is provided', () => {
    const args = argsToByte('SET_CHANNEL_INHIBITS', { channels: Array(5).fill(1) }, 6)
    const sequence = 1
    const count = 1

    const result = getPacket('SET_CHANNEL_INHIBITS', args, sequence, key, count)
    expect(result).toBeDefined()
  })

  test('generates packet without encryption when encryption key is not provided', () => {
    const sequence = 1
    const result = getPacket('RESET', Buffer.from([]), sequence)
    expect(result).toBeDefined()
  })

  test('generates packet with encrypted data for PAYOUT_AMOUNT command when encryption key is provided', () => {
    const args = argsToByte('PAYOUT_AMOUNT', { amount: 5, country_code: 'EUR' }, 6)
    const sequence = 1
    const count = 1

    const result = getPacket('PAYOUT_AMOUNT', args, sequence, key, count)
    expect(result).toBeDefined() // Assert whatever you expect from the result
  })
})
