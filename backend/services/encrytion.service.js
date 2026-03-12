import bcrypt, { hash } from 'bcrypt'

const salt = 10

export async function hashPassword(password) {
    const hashPassword = await bcrypt.hash(password, salt)
    return hashPassword
}

export async function comparePassword(password, hashedPassword) {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
}

