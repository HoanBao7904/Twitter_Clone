import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersServices from '~/services/users.services'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    })
  }
  next()
}

export const registerValidator = checkSchema({
  name: {
    notEmpty: true,
    isLength: {
      options: {
        min: 3,
        max: 50
      }
    },

    trim: true
  },
  email: {
    notEmpty: true,
    isEmail: true,
    trim: true,
    custom: {
      options: async (value) => {
        //value là email mà người dùng nhập vào, req là request object, nó chứa tất cả thông tin của request, bao gồm body, params, query, headers, cookies, session, user, ...
        const isExistEmail = await usersServices.CheckEmail(value)
        if (isExistEmail) {
          throw new Error('Email đã tồn tại, vui lòng sử dụng email khác.')
        }
        return true
      }
    }
  },
  password: {
    notEmpty: true,
    isLength: {
      options: {
        min: 6,
        max: 50
      }
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
    notEmpty: true,
    isLength: {
      options: {
        min: 6,
        max: 50
      }
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
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      }
    }
  }
})
