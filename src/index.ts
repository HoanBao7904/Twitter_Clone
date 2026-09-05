import 'module-alias/register'
import express from 'express'
import databaService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import mediasRouter from './routes/medias.route'
import { initFolder } from './utils/file'

// import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/statics.route'
import tweetRoutes from './routes/tweets.route'
import bookMarksRouter from './routes/bookmarks.route'
import likesRouter from './routes/likes.route'
import useRoutes from './routes/users.route'
import '~/utils/s3'
import cors, { CorsOptions } from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import converSationsRouter from './routes/conversations.route'
import initSocket from './utils/socket'
import YAML from 'yaml'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig, isProduction } from './constants/config'
import { rateLimit } from 'express-rate-limit'
// import fs from 'fs'
// import path from 'path'

// import { da } from '@faker-js/faker/.'

// import '~/utils/fake'

// const file = fs.readFileSync(path.resolve('./src/twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

// const options: swaggerJsdoc.Options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Twitter API Documentation',
//       version: '1.0.0'
//     },
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT'
//         }
//       }
//     }
//   },
//   apis: ['./src/routes/*.route.ts', './src/models/schemas/*.schema.ts'] // files containing annotations as above
// }

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter API Documentation',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./openapi/users/*.yaml'] // files containing annotations as above
}
const openapiSpecification = swaggerJsdoc(options)

// console.log(path.resolve('src/templates/verify-email.html'))

databaService.connect()
const PORT = envConfig.port

// console.log(process.argv)
const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Thời gian theo dõi (mili-giây): 15 phút * 60 giây * 1000ms
  limit: 100, // Số lượng request tối đa được phép trong khoảng windowMs (100 request/15 phút)
  standardHeaders: 'draft-8', // Bật các Response Header chuẩn IETF mới nhất (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
  legacyHeaders: false, // Tắt các Response Header kiểu cũ (X-RateLimit-Limit, X-RateLimit-Remaining...)
  ipv6Subnet: 56 // Gom nhóm các IP thuộc cùng dải IPv6 (/56) vào chung 1 bộ đếm để chống đổi IP lách luật
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

const httpServer = createServer(app)
const corsOptions: CorsOptions = {
  //nếu môi trường là production thì chỉ cho phép domain của client truy cập
  //còn môi trường khác thì cho phép tất cả các domain truy cập
  origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(helmet()) // bảo mật cho app, nó sẽ set các header bảo mật cho app
app.use(cors(corsOptions))

app.use(express.json())
// đây là middleware, nó sẽ chạy trước khi vào route, nó sẽ parse body của request thành json
// nếu không có cái này thì req.body sẽ là undefined
// ông này hoán đổi json của phía client thành object của phía server, để phía server có thể sử dụng được
// const router = express.Router()

//tao folder uploads
initFolder()

app.use('/users', useRoutes) // này là mount router vào app, tất cả các route trong router sẽ có prefix là /api

app.use('/medias', mediasRouter)

app.use('/tweets', tweetRoutes)

app.use('/bookmarks', bookMarksRouter)

app.use('/likes', likesRouter)

// app.use('/static/uploads/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/static', staticRouter)

app.use('/conversations', converSationsRouter)

app.use(defaultErrorHandler)

initSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

// app.listen(PORT, () => {
//   // nghiax la khi
//   console.log(`listening on port ${PORT}`)
// })

//hoanbao79
//2FvCL34jtuN9Amku
