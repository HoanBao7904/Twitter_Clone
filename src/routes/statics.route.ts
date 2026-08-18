import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controller'

const staticRouter = Router()

staticRouter.get('/uploads/image/:name', serveImageController)
staticRouter.get('/uploads/video-stream/:name', serveVideoStreamController)

export default staticRouter
