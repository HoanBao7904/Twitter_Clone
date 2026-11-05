import { Router } from 'express'
import {
  getNotificationsController111,
  markAllReadController,
  markReadController,
  unreadCountController
} from '~/controllers/notifications.controller'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const notificationsRouter = Router()

notificationsRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNotificationsController111)
)
notificationsRouter.get(
  '/unread-count',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(unreadCountController)
)
// route cố định phải đặt TRƯỚC route có :param
notificationsRouter.patch(
  '/read-all',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(markAllReadController)
)
notificationsRouter.patch(
  '/:notification_id/read',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(markReadController)
)

export default notificationsRouter
