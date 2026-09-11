import { Router } from 'express'
import { searchController } from '~/controllers/searchs.controller'
import { searchValidator } from '~/middlewares/search.middleware'
import { panigationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'

const searchRouter = Router()

searchRouter.get('/', accessTokenValidator, verifyUserValidator, searchValidator, panigationValidator, searchController)

export default searchRouter
