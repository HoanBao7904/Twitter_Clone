// import { Request, Response, NextFunction } from 'express'
import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { httpStatus } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
// import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'
import { HashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: 'email không được để trống'
        },
        isEmail: {
          errorMessage: 'email không hợp lệ'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: HashPassword(req.body.password)
            })
            if (!user) {
              // user === null
              throw new Error('email hoặc passworld đã sai')
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: 'mật khẩu không được để trống'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'mật khẩu phải có độ dài từ 6 đến 50 ký tự'
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Mật khẩu phải có độ dài ít nhất 6 ký tự và bao gồm ít nhất một chữ cái thường, một chữ cái in hoa, một chữ số và một ký tự đặc biệt.'
        },
        trim: true,
        isString: true // nghĩa là phải là chuỗi
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: 'tên không được để trống'
        },
        isLength: {
          options: {
            min: 3,
            max: 50
          },
          errorMessage: 'tên phải có độ dài từ 3 đến 50 ký tự'
        },

        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: 'email không được để trống'
        },
        isEmail: {
          errorMessage: 'email không hợp lệ'
        },
        trim: true,
        custom: {
          options: async (value) => {
            //value là email mà người dùng nhập vào, req là request object, nó chứa tất cả thông tin của request, bao gồm body, params, query, headers, cookies, session, user, ...
            const isExistEmail = await usersServices.CheckEmail(value)
            if (isExistEmail) {
              throw new Error('email đã tồn tại')
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: 'mật khẩu không được để trống'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'mật khẩu phải có độ dài từ 6 đến 50 ký tự'
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Mật khẩu phải có độ dài ít nhất 6 ký tự và bao gồm ít nhất một chữ cái thường, một chữ cái in hoa, một chữ số và một ký tự đặc biệt.'
        },
        trim: true,
        isString: true // nghĩa là phải là chuỗi
      },
      confirm_Password: {
        notEmpty: {
          errorMessage: 'xác nhận mật khẩu không được để trống'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'xác nhận mật khẩu phải có độ dài từ 6 đến 50 ký tự'
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Mật khẩu phải có độ dài ít nhất 6 ký tự và bao gồm ít nhất một chữ cái thường, một chữ cái in hoa, một chữ số và một ký tự đặc biệt.'
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Mật khẩu xác nhận không khớp với mật khẩu.')
            }
            return true
          }
        },
        trim: true,
        isString: true // nghĩa là phải là chuỗi
      },
      date_Of_Birth: {
        notEmpty: {
          errorMessage: 'ngày tháng năm sinh không được để trống'
        },
        trim: true,
        isISO8601: {
          errorMessage: 'ngày tháng năm không hợp lệ', // kiểm tra định dạng ngày tháng năm
          options: {
            strict: true,
            strictSeparator: true
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            //khi nhan co chu 'Bearer ashshsh' muc dich lay token thui bo 'bearer'
            // const access_token = value.replace('Bearer ', '')
            const access_token = (value || '').split(' ')[1] //laays phan tu so 1
            if (!access_token) {
              throw new ErrorWithStatus({
                message: 'Access Token  is required',
                status: httpStatus.UNAUTHORIZED
              })
            }
            if (!access_token) {
              throw new ErrorWithStatus({ message: 'acesstoken is riquered', status: httpStatus.UNAUTHORIZED })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublickey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: httpStatus.UNAUTHORIZED
              })
            }

            return true
            // const user = databaseService.users.findOne({ accessToken })
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_Token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          try {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Refresh Token  is required',
                status: httpStatus.UNAUTHORIZED
              })
            }
            // const decoded_refresh_token = await verifyToken({ token: value })
            // await databaseService.refreshtokens.find({ token: value })
            //nếu làm như này thì hai thz nó độc lập nhưng phải đợi trên trước dưới mới chạy tiếp thì hiệu suất ko tốt
            //giải pháo promise all
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({ token: value, secretOrPublickey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
              databaseService.refreshtokens.findOne({ token: value })
            ])
            if (refresh_token === null) {
              throw new ErrorWithStatus({
                message: 'refresh token đã được dùng hoặc token hết hạn',
                status: httpStatus.UNAUTHORIZED
              })
            }
            ;(req as Request).decoded_refresh_token = decoded_refresh_token
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({ message: 'refresh token is invalid', status: httpStatus.UNAUTHORIZED })
            }
            throw error
          }

          // console.log('decoded_refresh_token', decoded_refresh_token)
          return true
        }
      }
    }
  })
)

export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({ message: 'email verify token is required', status: httpStatus.UNAUTHORIZED })
          }
          // const decoded_refresh_token = await verifyToken({ token: value })
          // await databaseService.refreshtokens.find({ token: value })
          //nếu làm như này thì hai thz nó độc lập nhưng phải đợi trên trước dưới mới chạy tiếp thì hiệu suất ko tốt
          //giải pháo promise all
          try {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublickey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            })

            ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
          } catch (error) {
            throw new ErrorWithStatus({
              message: (error as JsonWebTokenError).message,
              status: httpStatus.UNAUTHORIZED
            })
          }

          // console.log('decoded_refresh_token', decoded_refresh_token)
          return true
        }
      }
    }
  })
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: 'email không được để trống'
        },
        isEmail: {
          errorMessage: 'email không hợp lệ'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (!user) {
              // user === null
              throw new Error('not found')
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotpasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'forgot password token is reqiued',
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_passworld_token = await verifyToken({
                token: value,
                secretOrPublickey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              const { user_id } = decoded_forgot_passworld_token
              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
              if (user === null) {
                throw new ErrorWithStatus({
                  message: 'user not found',
                  status: httpStatus.UNAUTHORIZED
                })
              }

              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: 'invalid forgot_passworld_token',
                  status: httpStatus.UNAUTHORIZED
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: httpStatus.UNAUTHORIZED
                })
              }
            }
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: {
        notEmpty: {
          errorMessage: 'mật khẩu không được để trống'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'mật khẩu phải có độ dài từ 6 đến 50 ký tự'
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Mật khẩu phải có độ dài ít nhất 6 ký tự và bao gồm ít nhất một chữ cái thường, một chữ cái in hoa, một chữ số và một ký tự đặc biệt.'
        },
        trim: true,
        isString: true // nghĩa là phải là chuỗi
      },
      confirm_Password: {
        notEmpty: {
          errorMessage: 'xác nhận mật khẩu không được để trống'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'xác nhận mật khẩu phải có độ dài từ 6 đến 50 ký tự'
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Mật khẩu phải có độ dài ít nhất 6 ký tự và bao gồm ít nhất một chữ cái thường, một chữ cái in hoa, một chữ số và một ký tự đặc biệt.'
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Mật khẩu xác nhận không khớp với mật khẩu.')
            }
            return true
          }
        },
        trim: true,
        isString: true // nghĩa là phải là chuỗi
      },
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'forgot password token is reqiued',
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_passworld_token = await verifyToken({
                token: value,
                secretOrPublickey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              const { user_id } = decoded_forgot_passworld_token
              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
              if (user === null) {
                throw new ErrorWithStatus({
                  message: 'user not found',
                  status: httpStatus.UNAUTHORIZED
                })
              }

              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: 'invalid forgot_passworld_token',
                  status: httpStatus.UNAUTHORIZED
                })
              }
              req.decoded_forgot_passworld_token = decoded_forgot_passworld_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: httpStatus.UNAUTHORIZED
                })
              }
            }
          }
        }
      }
    },
    ['body']
  )
)
