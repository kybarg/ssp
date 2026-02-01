import crypto from 'node:crypto'

export function decrypt(key: Buffer, data: Buffer): Buffer {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  const decipher = crypto.createDecipheriv('aes-128-ecb', key, null)
  decipher.setAutoPadding(false)
  return Buffer.concat([decipher.update(data), decipher.final()])
}
