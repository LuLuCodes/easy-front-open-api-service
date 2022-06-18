import * as crypto from 'crypto';
import * as cryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Make uuid
 */
export function uuid(): string {
  return uuidv4();
}

/**
 * Make salt
 */
export function makeSalt(len: number): string {
  return crypto.randomBytes(len).toString('base64');
}

/**
 * Encrypt password
 * @param password 密码
 * @param salt 密码盐
 */
export function encryptPassword(password: string, salt: string): string {
  if (!password || !salt) {
    return '';
  }
  const tempSalt = Buffer.from(salt, 'base64');
  return (
    // 10000 代表迭代次数 16代表长度
    crypto.pbkdf2Sync(password, tempSalt, 10000, 16, 'sha1').toString('base64')
  );
}

/**
 * AES-128-CBC 加密方法
 * @param key  加密key
 * @param iv   向量
 * @param data 需要加密的数据
 */
export function aes128cbcEncrypt(
  key: Buffer,
  iv: Buffer,
  data: string,
): string {
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let crypted = cipher.update(data, 'utf8', 'binary');
  crypted += cipher.final('binary');
  crypted = Buffer.from(crypted, 'binary').toString('base64');
  return crypted;
}

/**
 * AES-128-CBC     解密方法
 * @param key      解密的key
 * @param iv       向量
 * @param crypted  密文
 */
export function aes128cbcDecrypt(
  key: Buffer,
  iv: Buffer,
  crypted: string,
): string {
  crypted = Buffer.from(crypted, 'base64').toString('binary');
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  // 设置自动 padding 为 true，删除填充补位
  decipher.setAutoPadding(true);
  let decoded = decipher.update(crypted, 'binary', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

/**
 * AES-256-ECB 加密方法
 * @param key  加密key
 * @param iv   向量
 * @param data 需要加密的数据
 */
export function aes256ecbEncrypt(
  key: Buffer,
  iv: Buffer,
  data: string,
): string {
  const cipher = crypto.createCipheriv('aes-256-ecb', key, iv);
  let crypted = cipher.update(data, 'utf8', 'binary');
  crypted += cipher.final('binary');
  crypted = Buffer.from(crypted, 'binary').toString('base64');
  return crypted;
}

/**
 * AES-256-ECB     解密方法
 * @param key      解密的key
 * @param iv       向量
 * @param crypted  密文
 */
export function aes256ecbDecrypt(
  key: Buffer,
  iv: Buffer,
  crypted: string,
): string {
  crypted = Buffer.from(crypted, 'base64').toString('binary');
  const decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
  // 设置自动 padding 为 true，删除填充补位
  decipher.setAutoPadding(true);
  let decoded = decipher.update(crypted, 'binary', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

/**
 * hmacsha256 加密
 * @param data
 * @param key
 */
export function hmacsha256(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex');
}

export function md5(data: string): string {
  return hash(data, 'md5');
}

export function sha1(data: string): string {
  return hash(data, 'sha1');
}
export function hash(data: string, algorithm: string): string {
  return crypto.createHash(algorithm).update(data, 'utf8').digest('hex');
}

export function hashx(data: crypto.BinaryLike, algorithm: string): string {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * SHA256withRSA
 * @param data 待加密字符
 * @param privatekey 私钥key
 */
export function sha256WithRsa(data: string, privatekey: Buffer): string {
  return crypto
    .createSign('RSA-SHA256')
    .update(data)
    .sign(privatekey, 'base64');
}

/**
 * SHA256withRSA 验证签名
 * @param publicKey 公钥key
 * @param signature 待验证的签名串
 * @param data 需要验证的字符串
 */
export function sha256WithRsaVerify(
  publicKey: Buffer,
  signature: string,
  data: string,
): boolean {
  return crypto
    .createVerify('RSA-SHA256')
    .update(data)
    .verify(publicKey, signature, 'base64');
}

/**
 * AEAD_AES_256_GCM 解密
 * @param key
 * @param nonce
 * @param associatedData
 * @param ciphertext
 */
export function aes256gcmDecrypt(
  key: string,
  nonce: string,
  associatedData: string,
  ciphertext: string,
): string {
  const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
  const authTag = ciphertextBuffer.slice(ciphertextBuffer.length - 16);
  const data = ciphertextBuffer.slice(0, ciphertextBuffer.length - 16);
  const decipherIv = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipherIv.setAuthTag(Buffer.from(authTag));
  decipherIv.setAAD(Buffer.from(associatedData));
  const decryptStr = decipherIv.update(data, null, 'utf8');
  decipherIv.final();
  return decryptStr;
}
