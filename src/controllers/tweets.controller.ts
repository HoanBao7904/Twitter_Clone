import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { TweetParam, TweetQuery, TweetRequestBody } from '~/models/requests/Tweet.request'
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

export const getTweetController = async (req: Request<TweetParam, any, TweetQuery>, res: Response) => {
  //nếu query chỗ này thì vấn đề query vào db 2 lần vì trước đó query chỗ validate rồi
  const result = await tweetsServices.increaseView(req.params.tweet_id as string, req.decoded_authorization?.user_id)
  // console.log('result', result)

  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }

  return res.json({
    message: 'Get Tweet SuccessFully',
    result: tweet
  })
}

export const getTweetChirldrenController = async (req: Request, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id
  const { tweetsComent, total } = await tweetsServices.getTweerChilrdren({
    tweet_id: req.params.tweet_id as string,
    tweet_type,
    limit,
    page,
    user_id: user_id as string
  })
  return res.json({
    message: 'Get Tweet Chirldren SuccessFully',
    tweets: tweetsComent,
    page: page,
    limit: limit,
    total_page: Math.ceil(total / limit)
  })
}
