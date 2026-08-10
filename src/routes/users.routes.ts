import { Router } from 'express'
import { loginController, LogoutController, registerController } from '~/controllers/users.controller'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
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
  accessTokenValidator,
  refreshTokenValidator,
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

export default useRoutes
