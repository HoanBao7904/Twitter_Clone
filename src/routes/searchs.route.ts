import { Router } from 'express'
import { searchController, searchHashtagsController } from '~/controllers/searchs.controller'
import { searchHastagsValidator, searchValidator } from '~/middlewares/search.middleware'
import { panigationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'

const searchRouter = Router()

searchRouter.get(
  '/hashtags',
  accessTokenValidator,
  verifyUserValidator,
  searchHastagsValidator,
  searchHashtagsController
)
searchRouter.get('/', accessTokenValidator, verifyUserValidator, searchValidator, panigationValidator, searchController)

export default searchRouter
