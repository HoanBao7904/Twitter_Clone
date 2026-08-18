import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controller'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', accessTokenValidator, verifyUserValidator, wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload-video', accessTokenValidator, verifyUserValidator, wrapRequestHandler(uploadVideoController))

export default mediasRouter
