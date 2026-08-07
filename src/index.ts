import express from 'express'
import useroutes from './routes/users.routes'
import databaService from './services/database.services'
const PORT = 3000
const app = express()
app.use(express.json())
// đây là middleware, nó sẽ chạy trước khi vào route, nó sẽ parse body của request thành json
// nếu không có cái này thì req.body sẽ là undefined
// ông này hoán đổi json của phía client thành object của phía server, để phía server có thể sử dụng được
// const router = express.Router()

app.use('/users', useroutes) // này là mount router vào app, tất cả các route trong router sẽ có prefix là /api
databaService.connect()
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

//hoanbao79
//2FvCL34jtuN9Amku
