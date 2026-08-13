import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { httpStatus } from '~/constants/httpStatus'
import {
  forgotPasswordReqBody,
  LogoutRequestBody,
  RegisterRequestBody,
  resetPasswordReqBody,
  Tokenpayload,
  VerifyEmailReqBody
} from '~/models/requests/User.request'
import User from '~/models/schemas/User.schemas'
import databaseService from '~/services/database.services'
// import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'

export const loginController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  // throw new Error('looix')
  const user = req.user as User
  // console.log(user)
  const user__id = user._id as ObjectId
  const result = await usersServices.loginUser(user__id.toString())
  res.json({
    message1: 'login success',
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
  // next: NextFunction
) => {
  // const { email, password } = req.body
  // throw new Error('lỗi')
  const result = await usersServices.registerUser(req.body)
  res.json({
    message: 'Register successful',
    result
  })
}

export const LogoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_Token } = req.body
  const result = await usersServices.logout(refresh_Token)
  return res.json(result)
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const user_id = req.decoded_refresh_token?.user_id
  const new_access_token = await usersServices.refershToken(user_id as string)
  return res.json({
    message: 'Refresh token successfully',
    access_token: new_access_token
  })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as Tokenpayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: 'user not found'
    })
  }
  //đã verify rồi thì mình không báo lỗi
  // trả về status ok 200 với mess đã verify trước đó
  if (user.email_verify_token === '') {
    return res.status(httpStatus.OK).json({
      message: 'đã verify email này trước đó'
    })
  }

  const result = await usersServices.verifyEmail(user_id)
  return res.json({
    message: 'success verify email',
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: 'user not found'
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(httpStatus.OK).json({
      message: 'email da duoc verify truowc do'
    })
  }
  const result = await usersServices.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response
) => {
  const { _id } = req.user as User
  const result = await usersServices.forgotPassword(new ObjectId(_id).toString())
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response
) => {
  return res.json({
    message: 'verify forgot password token success'
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordReqBody>,
  res: Response
) => {
  const { password } = req.body
  const { user_id } = req.decoded_forgot_passworld_token as Tokenpayload
  const result = await usersServices.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const result = await usersServices.getMe(user_id)
  return res.json({
    message: 'user get profile success',
    result: result
  })
}

// export const emailVerifyValidator = async (req: Request, res: Response) => {
//   // 1. Lấy user_id từ token đã verify
//   const { user_id } = req.decoded_email_verify_token as Tokenpayload

//   // 2. Tìm user trong database
//   const user = await databaseService.users.findOne({
//     _id: new ObjectId(user_id)
//   })

//   if (!user) {
//     return res.status(httpStatus.NOT_FOUND).json({
//       message: 'User not found'
//     })
//   }

//   // 3. Kiểm tra đã verify chưa
//   if (user.email_verify_token === '') {
//     return res.status(httpStatus.OK).json({
//       message: 'Email already verified'
//     })
//   }

//   // 4. Verify email
//   const result = await usersServices.verifyEmail(user_id)

//   // 5. ✅ Trả về response bằng res.json()
//   return res.status(httpStatus.OK).json({
//     message: 'Email verified successfully',
//     result
//   })
// }
