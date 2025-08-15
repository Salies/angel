import { randomBytes } from 'crypto'
import bcrypt from 'bcrypt';

export function generatePassword() {
    return randomBytes(16).toString('base64url').slice(0, 16);
}

export function hashPassword(password: string) {
    return bcrypt.hashSync (password, 12);
}

export function verifyPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash)
}

export function generateToken() {
    return randomBytes(16).toString('hex')
}