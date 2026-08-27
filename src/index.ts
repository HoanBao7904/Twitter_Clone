import express from 'express'

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
import useRoutes from './routes/users.routes'
import '~/utils/s3'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { da } from '@faker-js/faker/.'
// import '~/utils/fake'
config()
// console.log(path.resolve('src/templates/verify-email.html'))

databaService.connect()
const PORT = process.env.PORT || 4000

// console.log(process.argv)
const app = express()

const httpServer = createServer(app)

app.use(cors())

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
// console.log(UPLOAD_IMAGE_DIR)
// app.use('/static/uploads/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  console.log(`userid: ${socket.id} connected `)
  console.log(socket.handshake.auth)
  console.log(socket.handshake.auth._id1)

  const userId = socket.handshake.auth._id1

  users[userId] = {
    socket_id: socket.id
  }
  console.log(users)

  socket.on('private message', (data) => {
    //lấy id socket từ userId muốn gửi đến(xác định được muốn gửi tới thz đó)
    const receiver_socket_id = users[data.to]?.socket_id
    if (!receiver_socket_id) {
      return
    }

    console.log('receiver_socket_id', receiver_socket_id)
    socket.to(receiver_socket_id).emit('receiver private message', {
      content: data.value,
      from: userId
    })
  })
  socket.on('disconnect', () => {
    delete users[userId]
    console.log(`userid: ${socket.id} disconnected `)
  })
})

httpServer.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

// app.listen(PORT, () => {
//   // nghiax la khi
//   console.log(`listening on port ${PORT}`)
// })

//hoanbao79
//2FvCL34jtuN9Amku
