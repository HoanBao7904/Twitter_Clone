import { Server } from 'socket.io'
import { verifyAccessToken } from './commons'
import { Tokenpayload } from '~/models/requests/User.request'
import { ErrorWithStatus } from '~/models/Errors'
import { UserVerifyStatus } from '~/constants/enums'
import Conversation from '~/models/schemas/Conversation.schema'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { Server as httpServer } from 'http'

const initSocket = (httpServer: httpServer) => {
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

  //đây là socket.io middleware , nó sẽ chạy trước khi vào connection
  io.use(async (socket, next) => {
    const Authorization = socket.handshake.auth.Authorization

    const accessToken = Authorization?.split(' ')[1]

    try {
      const decoded_authorization = await verifyAccessToken(accessToken)
      const { verify } = decoded_authorization as Tokenpayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: 'user not verified',
          status: 403
        })
      }
      //tryền decoded_authorization vào socket.handshake.auth để có thể sử dụng ở middleware tiếp theo
      //truyền accessToken vào socket.handshake.auth để có thể sử dụng ở middleware tiếp theo
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = accessToken
      next() // để nhảy đến middleware tiếp theo, nếu không có next() thì sẽ bị treo ở đây
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'Unauthorized',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    console.log('SOCKET CONNECTED:', socket.id)
    console.log('socket.auth = ', socket.handshake.auth)
    const { user_id } = socket.handshake.auth.decoded_authorization

    users[user_id] = {
      socket_id: socket.id
    }

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Authorized'))
      }
    })

    socket.on('error', (err) => {
      if (err.message === 'Authorized') {
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data) => {
      console.log(data)
      //lấy id socket từ userId muốn gửi đến(xác định được muốn gửi tới thz đó)
      const { content, sender_id, receiver_id } = data.payload
      const receiver_socket_id = users[receiver_id]?.socket_id

      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        content: content,
        receiver_id: new ObjectId(receiver_id)
      })

      try {
        const result = await databaseService.converSation.insertOne(conversation)
        conversation._id = result.insertedId
        console.log('INSERTED:', result.insertedId) // xác nhận có insert thật không

        if (receiver_socket_id) {
          socket.to(receiver_socket_id).emit('receive_message', {
            payload: conversation
          })
        }
      } catch (error) {
        console.error('INSERT MESSAGE FAILED:', error) // giờ mới thấy lỗi thật nếu có
      }

      // const result = await databaseService.converSation.insertOne(conversation)
      // conversation._id = result.insertedId

      // if (receiver_socket_id) {
      //   socket.to(receiver_socket_id).emit('receive_message', {
      //     payload: conversation
      //   })
      // }
    })
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`userid: ${socket.id} disconnected `)
    })
  })
}

export default initSocket
