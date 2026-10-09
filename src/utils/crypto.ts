import { createHash } from 'crypto'
import { envConfig } from '~/constants/config'

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function HashPassword(password: string) {
  return sha256(password + envConfig.passwordSecret)
}

console.log(sha256('Hoanbao7904@' + envConfig.passwordSecret))
