import { Request } from 'express'
import { httpStatus } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { JsonWebTokenError } from 'jsonwebtoken'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number')
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: 'Access Token  is required 111',
      status: httpStatus.UNAUTHORIZED
    })
  }

  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublickey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: (error as JsonWebTokenError).message,
      status: httpStatus.UNAUTHORIZED
    })
  }
}
