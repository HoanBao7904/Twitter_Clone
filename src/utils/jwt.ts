import jwt, { JwtPayload } from 'jsonwebtoken'

import dotenv from 'dotenv'
import { error } from 'console'
import { reject } from 'lodash'
import { resolve } from 'path'
import { Tokenpayload } from '~/models/requests/User.request'
dotenv.config()

export const SignToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err)
      return resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublickey = process.env.JWT_SECRET as string
}: {
  token: string
  secretOrPublickey?: string
}) => {
  return new Promise<Tokenpayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublickey, (error, decoded) => {
      if (error) {
        reject(error)
      }
      resolve(decoded as Tokenpayload)
    })
  })
}
