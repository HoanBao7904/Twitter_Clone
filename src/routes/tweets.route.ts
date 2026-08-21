import { Router } from 'express'
import { createtweetController, getTweetChirldrenController, getTweetController } from '~/controllers/tweets.controller'
import { audienceValidator, createtweetValidator, tweetIdvalidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRoutes = Router()
/**
 * Description: post Tweet
 * path: /
 * method: POST
 * header :{Authorization: Bearer <access_token>}
 * body: TweetRequestBody
 */

tweetRoutes.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  createtweetValidator,
  wrapRequestHandler(createtweetController)
)

/**
 * Description: get Tweet detail
 * path: /:tweet_id
 * method: GET
 * header ?:{Authorization: Bearer <access_token>}
 */

tweetRoutes.get(
  '/:tweet_id',
  tweetIdvalidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  wrapRequestHandler(tweetIdvalidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * Description: get Tweet Children
 * path: /:tweet_id/children
 * method: GET
 * header ?:{Authorization: Bearer <access_token>}
 * Query:{limit:number, page:number, tweet_type:TweetType}
 */

tweetRoutes.get(
  '/:tweet_id/children',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  wrapRequestHandler(tweetIdvalidator),
  audienceValidator,
  wrapRequestHandler(getTweetChirldrenController)
)

export default tweetRoutes
