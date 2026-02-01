import crypto from 'node:crypto'

export function encrypt(key: Buffer, data: Buffer): Buffer {
  if (!key || !Buffer.isBuffer(key)) {
    throw new Error('Key must be a Buffer')
  }

  if (!data || !Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer')
  }

  const cipher = crypto.createCipheriv('aes-128-ecb', key, null)
  cipher.setAutoPadding(false)
  return Buffer.concat([cipher.update(data), cipher.final()])
}
