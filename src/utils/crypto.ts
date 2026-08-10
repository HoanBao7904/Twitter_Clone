import { createHash } from 'crypto'
import dotenv from 'dotenv'
dotenv.config()
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function HashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}

console.log('hello' + process.env.PASSWORD_SECRET)
