import * as crypto from 'crypto';

import dotenv from 'dotenv';
dotenv.config();

const algorithm = 'aes-256-gcm';
const keyBase64 = process.env.ENCRYPTION_KEY_BASE64!;

export function encrypt(text: string) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(keyBase64, 'base64');
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encryptedData = Buffer.concat([iv, tag, ciphertext]);
  return encryptedData.toString('base64');
}

export function decrypt(encryptedDataBase64: string) {
  if (!encryptedDataBase64) return '';
  const buffer = Buffer.from(encryptedDataBase64, 'base64');

  const iv = buffer.subarray(0, 16);
  const tag = buffer.subarray(16, 32);
  const ciphertext = buffer.subarray(32);

  const key = Buffer.from(keyBase64, 'base64');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  try {
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Fehler beim Entschlüsseln:', (err as unknown as Error).message);
    throw new Error('Entschlüsselung fehlgeschlagen');
  }
}
