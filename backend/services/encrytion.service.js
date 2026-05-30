import bcrypt, { hash } from 'bcrypt'
import crypto from 'crypto'

const salt = 10

export async function hashPassword(password) {
    const hashPassword = await bcrypt.hash(password, salt)
    return hashPassword
}

export async function comparePassword(password, hashedPassword) {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
}


const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

/**
 * Encrypts a plain-text token.
 * @param {string} token - Plain text access token
 * @returns {string} - Encrypted string in format "ivHex:encryptedHex"
 */
export function encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-encrypted token.
 * @param {string} encryptedToken - In format "ivHex:encryptedHex"
 * @returns {string} - Plain text access token
 */
export function decryptToken(encryptedToken) {
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
