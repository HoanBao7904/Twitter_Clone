import LikeTweet from '~/models/schemas/Like.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { TweetAudience } from '~/constants/enums'

class LikesService {
  async LikeTweet(tweet_id: string, user_id: string) {
    const result = await databaseService.like.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new LikeTweet({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }

  async unLikeTweet(tweet_id: string, user_id: string) {
    const result = await databaseService.like.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }

  async ListLikedTweets({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const [result, total] = await Promise.all([
      databaseService.like
        .aggregate([
          {
            $match: {
              user_id: new ObjectId(user_id)
            }
          },
          {
            $sort: {
              created_at: -1
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'tweets',
              localField: 'tweet_id',
              foreignField: '_id',
              as: 'tweets'
            }
          },
          {
            $unwind: {
              path: '$tweets',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $match: {
              $or: [
                {
                  'tweets.audience': TweetAudience.TwitterCircle
                },
                {
                  'tweets.audience': TweetAudience.Everyone
                }
              ]
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'tweets._id',
              foreignField: 'tweet_id',
              as: 'tweets_like'
            }
          },
          {
            $project: {
              _id: 0,
              liked_at: '$created_at',
              is_liked: true,
              tweets: {
                content: '$tweets.content',
                type: '$tweets.type',
                audience: '$tweets.audience',
                medias: '$tweets.medias',
                hashtags: '$tweets.hashtags',
                mentions: '$tweets.mentions',
                guest_views: '$tweets.guest_views',
                user_views: '$tweets.user_views',
                created_at: '$tweets.created_at',
                author: {
                  _id: '$author._id',
                  name: '$author.name',
                  username: '$author.username',
                  avatar: '$author.avatar'
                },
                like_count: {
                  $size: '$tweets_like'
                }
              }
            }
          }
        ])
        .toArray(),
      databaseService.like.countDocuments({
        user_id: new ObjectId(user_id)
      })
    ])
    return { result, total }
  }
}

const likesService = new LikesService()

export default likesService
