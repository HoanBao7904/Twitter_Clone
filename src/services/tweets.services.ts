import { TweetRequestBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Twitter.schema'
import { ObjectId, WithId } from 'mongodb'
import HashTag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enums'
class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    //tìm hashtag trong db, nếu có thì lấy, không thì tạo mới
    const hashtagDocuemts = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtag.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new HashTag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuemts.map((hashtag) => (hashtag.value as WithId<HashTag>)._id)
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    console.log(hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtags as ObjectId[], //chỗ này chưa làm tạm thời để trống
        medias: body.medias,
        mentions: body.mentions,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )

    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  // async increaseView(tweet_id: string, user_id: string) {
  //   const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
  //   const result: FindOneAndUpdateResult<WithId<Tweet>> = await databaseService.tweets.findOneAndUpdate(
  //     { _id: new ObjectId(tweet_id) },
  //     {
  //       $inc: inc,
  //       $currentDate: {
  //         updated_at: true
  //       }
  //     },
  //     {
  //       returnDocument: 'after',
  //       projection: {
  //         guest_views: 1,
  //         user_views: 1
  //       }
  //     }
  //   )

  //   return result.value as {
  //     guest_views: number
  //     user_views: number
  //   }
  // }
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    )
    return result.value as WithId<{
      guest_views: number
      user_views: number
    }>
  }

  async getTweerChilrdren({
    tweet_id,
    tweet_type,
    limit,
    page
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
  }) {
    const tweetsComent = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweetCount: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'children',
                  cond: {
                    $eq: ['$$children.type', TweetType.Retweet]
                  }
                }
              }
            },
            CommentCount: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'children',
                  cond: {
                    $eq: ['$$children.type', TweetType.Comment]
                  }
                }
              }
            },
            QuoteCount: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'children',
                  cond: {
                    $eq: ['$$children.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1) //công thức phân trang
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const total = await databaseService.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: tweet_type
    })
    return { tweetsComent, total }
  }
}

const tweetsServices = new TweetsService()
export default tweetsServices
