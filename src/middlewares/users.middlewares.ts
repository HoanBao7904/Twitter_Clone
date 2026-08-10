import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'
import { HashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema({
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
          const user = await databaseService.users.findOne({ email: value, password: HashPassword(req.body.password) })
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
  })
)

export const registerValidator = validate(
  checkSchema({
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
  })
)
