import { Router } from 'express'
import { LikeTweetController, unLikeTweetController } from '~/controllers/likes.controller'
import { tweetIdvalidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

/**
 * Description: Like tweet
 * path: ''
 * method: POST
 * body: { tweet_id:string }
 * header :{Authorization: Bearer <access_token>}
 */
likesRouter.post(
  '',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdvalidator,
  wrapRequestHandler(LikeTweetController)
)

/**
 * Description: unLike tweet
 * path: '/tweets/:tweet_id'
 * method: DELETE
 * body: { tweet_id:string }
 * header :{Authorization: Bearer <access_token>}
 */
likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdvalidator,
  wrapRequestHandler(unLikeTweetController)
)

export default likesRouter
