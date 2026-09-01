import { Request, Response } from 'express'
import { GetConversationParams } from '~/models/requests/Conversation.request'
import conversationService from '~/services/conversations.services'

export const getConversationsController = async (req: Request<GetConversationParams, any, any, any>, res: Response) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const { receiver_id } = req.params
  const sender_id = req.decoded_authorization?.user_id as string // ← sửa chính tả
  const { conversations, totol } = await conversationService.getConversation(
    sender_id,
    receiver_id as string,
    page,
    limit
  ) // ← dùng biến đúng
  return res.json({
    message: 'Receiver SuccessFully',
    result: {
      result: conversations,
      limit: limit,
      page: page,
      total: totol
    }
  })
}
