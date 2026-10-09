import { Router } from 'express'
import { LikeTweetController, ListLikedTweetsController, unLikeTweetController } from '~/controllers/likes.controller'
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

/**
 * Description: List all liked tweets by user
 * path: '/history/likes'
 * method: GET
 * body: {}
 * header :{Authorization: Bearer <access_token>}
 */
likesRouter.get('/history', accessTokenValidator, verifyUserValidator, wrapRequestHandler(ListLikedTweetsController))

export default likesRouter
