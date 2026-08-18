import { JwtPayload } from 'jsonwebtoken'
import { TokenTypes } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'

export interface LoginRequestBody {
  email: string
  password: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface forgotPasswordReqBody {
  email: string
}
export interface resetPasswordReqBody {
  password: string
  confirm_Password: string
  forgot_password_token: string
}

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_Password: string
  date_Of_Birth: string
}

export interface LogoutRequestBody {
  refresh_Token: string
}

export interface Tokenpayload extends JwtPayload {
  user_id: string
  token_type: TokenTypes
}

export interface UpdateReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string
}

export interface getProfileReqParams extends ParamsDictionary {
  username: string
}

export interface changePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface SendFileError {
  errno: number
  code: string
  syscall: string
  path: string
  expose: boolean
  statusCode: number
  status: number
}
