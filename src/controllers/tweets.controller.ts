import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import { Tokenpayload } from '~/models/requests/User.request'
import tweetsServices from '~/services/tweets.services'
export const createtweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const result = await tweetsServices.createTweet(user_id, req.body)
  console.log(result)
  return res.json({
    message: 'createTweet SuccessFully',
    result: result
  })
}
//  async unbookMarkTweet(tweet_id: string, user_id: string) {

export const getTweetController = async (req: Request, res: Response) => {
  // const { user_id } = req.decoded_authorization as Tokenpayload
  // const result = await tweetsServices.createTweet(user_id, req.body)
  // console.log(result)
  return res.json({
    message: 'Get Tweet SuccessFully',
    result: 'ok'
  })
}
