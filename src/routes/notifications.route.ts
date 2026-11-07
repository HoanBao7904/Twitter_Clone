import { Router } from 'express'
import { getNotificationsController, readNotificationsController } from '~/controllers/notifications.controller'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const notificationsRouter = Router()
// route cố định phải đặt TRƯỚC route có :param

notificationsRouter.get('/', accessTokenValidator, verifyUserValidator, wrapRequestHandler(getNotificationsController))

notificationsRouter.put(
  '/readNotifacation',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(readNotificationsController)
)

export default notificationsRouter
