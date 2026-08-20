import { Router } from 'express'
import {
  bookMarkTweetController,
  unbookMarkTweetByBorkMarkIdController,
  unbookMarkTweetController
} from '~/controllers/bookMarks.controller'
import { tweetIdvalidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookMarksRouter = Router()

/**
 * Description: Bookmark tweet
 * path: /
 * method: POST
 * body: { tweet_id:string }
 * header :{Authorization: Bearer <access_token>}
 */

bookMarksRouter.post(
  '',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdvalidator,
  wrapRequestHandler(bookMarkTweetController)
)

/**
 * Description: unBookmark tweet
 * path: /tweets/:tweet_id
 * method: DELETE
 * header :{Authorization: Bearer <access_token>}
 */

bookMarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdvalidator,
  wrapRequestHandler(unbookMarkTweetController)
)

/**
 * Description: unBookmark tweet by borkmark id
 * path: /:borkmark_id
 * method: DELETE
 * header :{Authorization: Bearer <access_token>}
 */

bookMarksRouter.delete(
  '/:borkmark_id',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(unbookMarkTweetByBorkMarkIdController)
)
export default bookMarksRouter
