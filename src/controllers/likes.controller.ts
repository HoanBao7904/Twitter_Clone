import { Request, Response } from 'express'
import { PaginationQuery } from '~/models/requests/Tweet.request'
import { Tokenpayload } from '~/models/requests/User.request'
import likesService from '~/services/likes.services'

export const LikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const { tweet_id } = req.body
  const result = await likesService.LikeTweet(tweet_id.toString(), user_id)

  return res.json({
    message: 'LikeTweet SuccessFully',
    result: result
  })
}

export const unLikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const { tweet_id } = req.params
  const result = await likesService.unLikeTweet(tweet_id.toString(), user_id)

  return res.json({
    message: 'unLikeTweet SuccessFully',
    result: result
  })
}

export const ListLikedTweetsController = async (req: Request<any, any, any, PaginationQuery>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { result, total } = await likesService.ListLikedTweets({ user_id, limit, page })
  return res.json({
    message: 'Lấy danh sách tweet đã like thành công',
    result: {
      tweets: result,
      limit,
      page,
      total_page: Math.ceil(total / limit),
      total
    }
  })
}
