import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import BookMark from '~/models/schemas/BookMark.schema'
import { NotificationType, TweetAudience } from '~/constants/enums'
import Notification from '~/models/schemas/Notification.schema'

class BookMarksService {
  async bookMarkTweet(tweet_id: string, user_id: string) {
    // 1. CHECK XEM ĐÃ BOOKMARK CHƯA (Để tránh spam thông báo & lỗi DB)
    const existingBookmark = await databaseService.bookmark.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (existingBookmark) {
      return existingBookmark
    }

    const newBookmark = await databaseService.bookmark.insertOne(
      new BookMark({
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
          type: NotificationType.BOOKMARK,
          tweet_id: new ObjectId(tweet_id)
        })
      )
    }
    return newBookmark
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
      // đếm tổng số lượng tweet đã bookmark
      databaseService.bookmark.countDocuments({ user_id: new ObjectId(user_id) })
    ])
    return { result, total }
  }
}

const bookMarksService = new BookMarksService()
export default bookMarksService
