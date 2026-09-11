import { Router } from 'express'
import { searchController } from '~/controllers/searchs.controller'

const searchRouter = Router()

searchRouter.get('/', searchController)

export default searchRouter
