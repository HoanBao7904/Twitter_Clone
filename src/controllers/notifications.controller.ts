import { Request, Response } from 'express'
import { PaginationQuery } from '~/models/requests/Tweet.request'
import { Tokenpayload } from '~/models/requests/User.request'
import notificationsService from '~/services/notifications.services'

export const getNotificationsController = async (req: Request<any, any, any, PaginationQuery>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const limit = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const { result, total } = await notificationsService.getNotifications({ user_id, page, limit })
  return res.json({
    message: 'Get notifications successfully',
    result: {
      notifications: result,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const readNotificationsController = async (req: Request<{ notification_id: string }>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const { _id } = req.body
  const result = await notificationsService.readNotificationService(user_id, _id)
  return res.json({
    message: 'Đọc thông báo thành công',
    result
  })
}
