import express from 'express'
import useroutes from './routes/users.routes'
import databaService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import mediasRouter from './routes/medias.route'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
// import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/statics.route'
import tweetRoutes from './routes/tweets.route'
import bookMarksRouter from './routes/bookmarks.route'
import likesRouter from './routes/likes.route'
// import '~/utils/fake'
config()

databaService.connect()
const PORT = process.env.PORT || 4000
// console.log(process.argv)
const app = express()
app.use(express.json())
// đây là middleware, nó sẽ chạy trước khi vào route, nó sẽ parse body của request thành json
// nếu không có cái này thì req.body sẽ là undefined
// ông này hoán đổi json của phía client thành object của phía server, để phía server có thể sử dụng được
// const router = express.Router()

//tao folder uploads
initFolder()

app.use('/users', useroutes) // này là mount router vào app, tất cả các route trong router sẽ có prefix là /api

app.use('/medias', mediasRouter)

app.use('/tweets', tweetRoutes)

app.use('/bookmarks', bookMarksRouter)

app.use('/likes', likesRouter)
// console.log(UPLOAD_IMAGE_DIR)
// app.use('/static/uploads/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  // nghiax la khi
  console.log(`listening on port ${PORT}`)
})
//
// console.log(pick({ a: '1', b: 3 }, ['c']))

//hoanbao79
//2FvCL34jtuN9Amku
