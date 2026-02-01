import crypto from 'node:crypto'
import { GeneratedKeys } from '../types'

export function generateKeys(): GeneratedKeys {
  let generator = crypto.generatePrimeSync(16, { bigint: true, safe: true }) as bigint
  let modulus = crypto.generatePrimeSync(16, { bigint: true, safe: true }) as bigint

  if (generator === 0n || modulus === 0n) {
    throw new Error('GENERATOR and MODULUS should be > 0')
  }

  if (generator < modulus) {
    ;[modulus, generator] = [generator, modulus]
  }

  const hostRandom = BigInt(crypto.randomBytes(2).readUInt16LE()) % 2147483648n
  const hostInter = generator ** hostRandom % modulus

  return {
    generator,
    modulus,
    hostRandom,
    hostInter,
  }
}
