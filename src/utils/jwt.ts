import jwt, { SignOptions } from 'jsonwebtoken'
import { Tokenpayload } from '~/models/requests/User.request'

export const SignToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err)
      return resolve(token as string)
    })
  })
}

// const a = jwt.verify()

export const verifyToken = ({ token, secretOrPublickey }: { token: string; secretOrPublickey: string }) => {
  return new Promise<Tokenpayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublickey, (error, decoded) => {
      if (error) {
        reject(error)
      }
      resolve(decoded as Tokenpayload)
    })
  })
}
