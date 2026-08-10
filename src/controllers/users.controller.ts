import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { LogoutRequestBody, RegisterRequestBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schemas'
// import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
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
