import { Router } from 'express'
import {
  verifyEmailController,
  loginController,
  LogoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordTokenController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  FollowController
} from '~/controllers/users.controller'
import { filterMiddleware } from '~/middlewares/common.middleware'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyForgotpasswordTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateReqBody } from '~/models/requests/User.request'
import { wrapRequestHandler } from '~/utils/handlers'

// const router = express.Router()
const useRoutes = Router()

// useRoutes.use(
//   (req, res, next) => {
//     //đây gọi là middleware, nó sẽ chạy trước khi vào route
//     console.log(`time:`, Date.now())
//     // res.status(250).send('ok')
//     next()
//   },
//   (req, res, next) => {
//     //đây gọi là middleware, nó sẽ chạy trước khi vào route
//     console.log(`time2:`, Date.now())
//     next()
//   }
// )

/**
 * Description: Login a user
 * path: /login
 * method: POST
 * body: { password: string, email: string }
 */
useRoutes.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * Description: Register a new user
 * path: /register
 * method: POST
 * body: { username: string, password: string, email: string, date_Of_Birth: ISOString(ISO8601), confirm_Password: string }
 */
useRoutes.post(
  '/register',
  registerValidator,

  wrapRequestHandler(registerController)
)

/**
 * Description: logouyt a user
 * path: /logout
 * method: POST
 * header :{Authorization: Bearer <access_token>}
 * body: { refreshtoken: string }
 */

useRoutes.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(LogoutController))

useRoutes.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: verify email when user click on the link in email
 * path: /verify-email
 * method: POST
 * body: { email_verify_token: string }
 */

useRoutes.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description: verify email when user click on the link in email
 * path: /resend-verify-email
 * method: POST
 * header:{Authorization: Bearer <access_token>}
 * body: {  }
 */

useRoutes.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description: submit email to reset password
 * path: //forgot-password
 * method: POST
 * body: { email: string  }
 */

useRoutes.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: verify forgot password token
 * path: //verify-forgot-password
 * method: POST
 * body: { forgot_password_token: string  }
 */

useRoutes.post(
  '/verify-forgot-password',
  verifyForgotpasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)

/**
 * Description: reset password
 * path: /reset-password
 * method: POST
 * body: { forgot_password_token: string, passrord:string, confirm_password:string  }
 */

useRoutes.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: get me profile
 * path: /me
 * method: GET
 * header:{Authorization: Bearer <access_token>}
 */

useRoutes.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: update me profile
 * path: /me
 * method: PATCH
 * header:{Authorization: Bearer <access_token>}
 * body: {userschema}
 */
//method patch khác post chỗ path là khi một form bạn thay đổi cái input nào thì gửi cái đó thôi,
// còn post thì gửi form thì gửi hết các thông tin
useRoutes.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateReqBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: get user profile
 * path: /:username (:username thi key la username, neu :hahaha thi key la hahaha)
 * method: GET
 */

useRoutes.get('/:username', wrapRequestHandler(getProfileController))

/**
 * Description: follow user
 * path: /follow
 * method: POST
 * header:{Authorization: Bearer <access_token>}
 * body: {user_id: strig}
 */

useRoutes.post(
  '/follow',
  accessTokenValidator,
  verifyUserValidator,
  followValidator,
  wrapRequestHandler(FollowController)
)

export default useRoutes
