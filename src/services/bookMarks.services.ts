import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import BookMark from '~/models/schemas/BookMark.schema'

class BookMarksService {
  async bookMarkTweet(tweet_id: string, user_id: string) {
    //kiểm tra nếu có thì lấy , ko có thì tạo
    const result = await databaseService.bookmark.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new BookMark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
      // new BookMark({
      //   user_id: new ObjectId(user_id),
      //   tweet_id: new ObjectId(tweet_id)
      // })
    )
    return result
  }

  async unbookMarkTweet(tweet_id: string, user_id: string) {
    //kiểm tra nếu có thì xóa
    const result = await databaseService.bookmark.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }

  async unbookMarkTweetByBorkMarkId(borkmark_id: string) {
    //kiểm tra nếu có thì xóa
    const result = await databaseService.bookmark.findOneAndDelete({
      _id: new ObjectId(borkmark_id)
    })
    return result
  }

  async ListBookMarkTweets({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const [result, total] = await Promise.all([
      databaseService.bookmark
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
                  'tweets.audience': 1
                },
                {
                  'tweets.audience': 0
                }
              ]
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'users'
            }
          },
          {
            $unwind: {
              path: '$users',
              preserveNullAndEmptyArrays: false
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: 'tweets._id',
              foreignField: 'tweet_id',
              as: 'tweets_book'
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
                  _id: '$users._id',
                  name: '$users.name',
                  username: '$users.username',
                  avatar: '$users.avatar'
                },
                like_count: {
                  $size: '$tweets_book'
                }
              }
            }
          }
        ])
        .toArray(),
      databaseService.bookmark.countDocuments({ user_id: new ObjectId(user_id) })
    ])
    return { result, total }
  }
}

const bookMarksService = new BookMarksService()
export default bookMarksService
