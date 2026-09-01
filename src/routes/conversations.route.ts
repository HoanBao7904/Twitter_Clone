import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controller'
import { panigationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, getConversationValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const converSationsRouter = Router()

/**
 * Description: GET conversations
 * path: '/receiver/:receiver_id'
 * method: GET
 * params: {receiver_id: string}
 * query: {page: number, limit: number}
 * header :{Authorization: Bearer <access_token>}
 */
converSationsRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifyUserValidator,
  getConversationValidator,
  panigationValidator,
  wrapRequestHandler(getConversationsController)
)

export default converSationsRouter
