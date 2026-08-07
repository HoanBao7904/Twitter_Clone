import express, { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { validate } from '~/utils/validation'
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

useRoutes.post('/login', loginValidator, loginController)
/**
 * Description: Register a new user
 * path: /register
 * method: POST
 * body: { username: string, password: string, email: string, date_Of_Birth: ISOString(ISO8601), confirm_Password: string }
 */
useRoutes.post('/register', validate(registerValidator), registerController)

export default useRoutes
