import { Request, Response } from 'express'
import { Tokenpayload } from '~/models/requests/User.request'
import likesService from '~/services/likes.services'

export const LikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const { tweet_id } = req.body
  const result = await likesService.LikeTweet(tweet_id.toString(), user_id)
  console.log(result)
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
