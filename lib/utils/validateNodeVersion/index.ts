import { satisfies } from 'semver'
import { engines } from '../../../package.json'

export function validateNodeVersion(): void {
  if (!satisfies(process.version, engines.node)) {
    throw new Error(`Node.js version must be ${engines.node}`)
  }
}
