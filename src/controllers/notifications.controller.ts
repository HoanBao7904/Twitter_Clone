import { Request, Response } from 'express'
import { PaginationQuery } from '~/models/requests/Tweet.request'
import { Tokenpayload } from '~/models/requests/User.request'
import notificationsService from '~/services/notifications.services'

export const getNotificationsController = async (req: Request<any, any, any, PaginationQuery>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const limit = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const { result, total, unread } = await notificationsService.list({ user_id, page, limit })
  return res.json({
    message: 'Get notifications successfully',
    result: { notifications: result, limit, page, total_page: Math.ceil(total / limit), unread }
  })
}

export const getNotificationsController111 = async (req: Request<any, any, any, PaginationQuery>, res: Response) => {
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

export const unreadCountController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const count = await notificationsService.unreadCount(user_id)
  return res.json({ message: 'Get unread count successfully', result: { unread: count } })
}

export const markReadController = async (req: Request<{ notification_id: string }>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const result = await notificationsService.markRead(user_id, req.params.notification_id)
  return res.json(result)
}

export const markAllReadController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const result = await notificationsService.markAllRead(user_id)
  return res.json(result)
}
