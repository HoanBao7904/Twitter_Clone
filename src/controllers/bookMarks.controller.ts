import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookMarkReqBody } from '~/models/requests/BookMark.request'
import { Tokenpayload } from '~/models/requests/User.request'
import bookMarksService from '~/services/bookMarks.services'

export const bookMarkTweetController = async (req: Request<ParamsDictionary, any, BookMarkReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const { tweet_id } = req.body
  const result = await bookMarksService.bookMarkTweet(tweet_id.toString(), user_id)
  // console.log(result)
  return res.json({
    message: 'create bookmark SuccessFully',
    result: result
  })
}

export const unbookMarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const { tweet_id } = req.params
  const result = await bookMarksService.unbookMarkTweet(tweet_id.toString(), user_id)
  // console.log(result)
  return res.json({
    message: 'unbookmark SuccessFully',
    result: result
  })
}

export const unbookMarkTweetByBorkMarkIdController = async (req: Request, res: Response) => {
  const { borkmark_id } = req.params
  const result = await bookMarksService.unbookMarkTweetByBorkMarkId(borkmark_id.toString())
  // console.log(result)
  return res.json({
    message: 'unbookmark-Id SuccessFully',
    result: result
  })
}
