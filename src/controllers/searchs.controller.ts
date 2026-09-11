import { Request, Response } from 'express'
import { searchquery } from '~/models/requests/Search.request'
import searchService from '~/services/searchs.services'

export const searchController = async (req: Request<any, any, any, searchquery>, res: Response) => {
  const limit = Number(req.query.limit)
  const content = req.query.content
  const media_type = req.query.media_type
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id as string
  const { tweets, total } = await searchService.search({ limit, content, page, user_id, media_type })
  // return res.json({
  //   message: 'search SuccessFully',
  //   result: result
  // })
  return res.json({
    message: 'search SuccessFully',
    Search: tweets,
    page: page,
    limit: limit,
    media_type: media_type,
    total_page: Math.ceil(total / limit)
  })
}
