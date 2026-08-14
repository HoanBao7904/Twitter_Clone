import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { pick } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { httpStatus } from '~/constants/httpStatus'
import {
  FollowReqBody,
  forgotPasswordReqBody,
  getProfileReqParams,
  LogoutRequestBody,
  RegisterRequestBody,
  resetPasswordReqBody,
  Tokenpayload,
  UpdateReqBody,
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
  const result = await usersServices.loginUser({ user_id: user__id.toString(), verify: user.verify })
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
  const { _id, verify } = req.user as User
  const result = await usersServices.forgotPassword({ user_id: new ObjectId(_id).toString(), verify: verify })
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

export const getProfileController = async (req: Request<getProfileReqParams>, res: Response) => {
  const { username } = req.params
  console.log('req.params:', username)
  const result = await usersServices.getProfile(username)
  return res.json({
    message: 'get profile success',
    result: result
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  // const body = pick(req.body, [
  //   'name',
  //   'date_of_birth',
  //   'bio',
  //   'location',
  //   'website',
  //   'username',
  //   'avatar',
  //   'cover_photo'
  // ]) //pick nay nhan nhung key minh muon lay, bo key khac khong lay
  const { body } = req
  // console.log('body : ', body)
  const user = await usersServices.updateMe(user_id, body)
  return res.json({
    message: 'update me sucess',
    result: user
  })
}

export const FollowController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const { followed_user_id } = req.body
  // console.log('body : ', body)
  const result = await usersServices.follower(user_id, followed_user_id)
  return res.json(result)
}
