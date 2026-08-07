import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterRequestBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schemas'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  console.log(req.body)
  res.json({
    message: 'Login successful'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  // const { email, password } = req.body
  try {
    const result = await usersServices.registerUser(req.body)
    res.json({
      message: 'Register successful',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'Register failed',
      error
    })
  }
}
