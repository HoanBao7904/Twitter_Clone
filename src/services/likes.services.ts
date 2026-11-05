import LikeTweet from '~/models/schemas/Like.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { NotificationType, TweetAudience } from '~/constants/enums'
import notificationsService from './notifications.services'
import Notification from '~/models/schemas/Notification.schema'

class LikesService {
  async LikeTweet(tweet_id: string, user_id: string) {
    // 1. CHECK XEM ĐÃ LIKE CHƯA (Để tránh spam thông báo & lỗi DB)
    const existingLike = await databaseService.like.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (existingLike) {
      return existingLike
    }

    const newLike = await databaseService.like.insertOne(
      new LikeTweet({
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      })
    )
    const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(tweet_id) })

    // nếu tweet tồn tại và người like không phải là chủ sở hữu tweet thì mới tạo thông báo
    if (tweet && tweet.user_id.toString() !== user_id) {
      await databaseService.notification.insertOne(
        new Notification({
          sender_id: new ObjectId(user_id),
          receiver_id: new ObjectId(tweet.user_id),
          type: NotificationType.LIKE,
          tweet_id: new ObjectId(tweet_id)
        })
      )
    }
    return newLike
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
            $lookup: {
              from: 'tweets',
              localField: 'tweet_id',
              foreignField: '_id',
              as: 'tweets'
            }
          },
          {
            $unwind: {
              path: '$tweets'
            }
          },
          {
            //trường hợp lọc để chông một số tweet để chỉ mình tôi hoặc xóa bài tweet đó
            $match: {
              'tweets.audience': {
                $in: [TweetAudience.Everyone, TweetAudience.TwitterCircle]
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'tweets.user_id',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $limit: limit
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $project: {
              _id: 0,
              bookmarked_at: '$created_at',
              tweets: 1,
              author: {
                _id: '$author._id',
                name: '$author.name',
                username: '$author.username',
                avatar: '$author.avatar'
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
