import { NotificationType, TweetAudience } from '~/constants/enums'
import databaseService from './database.services'
import { Document, ObjectId } from 'mongodb'
import Notification from '~/models/schemas/Notification.schema'

interface CreateParams {
  sender: ObjectId
  receiver: ObjectId
  type: NotificationType
  tweet_id?: ObjectId
}

class NotificationsService {
  async create({ sender, receiver, type, tweet_id }: CreateParams) {
    if (sender.equals(receiver)) return // không tự báo cho chính mình

    // Like / Follow: mỗi cặp chỉ có 1 thông báo, like-unlike-like không spam
    if (type === NotificationType.LIKE || type === NotificationType.FOLLOW) {
      await databaseService.notification.updateOne(
        { sender, receiver, type, tweet_id },
        { $setOnInsert: { read: false, created_at: new Date() } },
        { upsert: true }
      )
      return
    }

    await databaseService.notification.insertOne(
      new Notification({ sender_id: sender, read: false, receiver_id: receiver, type, tweet_id })
    )
  }

  // Gọi khi unlike / unfollow
  async remove({ sender, receiver, type, tweet_id }: CreateParams) {
    await databaseService.notification.deleteOne({ sender_id: sender, receiver_id: receiver, type, tweet_id })
  }

  async list({ user_id, page, limit }: { user_id: string; page: number; limit: number }) {
    const receiver = new ObjectId(user_id)
    const [result, total, unread] = await Promise.all([
      databaseService.notification
        .aggregate([
          { $match: { receiver } },
          { $sort: { created_at: -1 } },
          { $skip: limit * (page - 1) },
          { $limit: limit },
          { $lookup: { from: 'users', localField: 'sender', foreignField: '_id', as: 'sender' } },
          { $unwind: '$sender' },
          { $lookup: { from: 'tweets', localField: 'tweet_id', foreignField: '_id', as: 'tweet' } },
          { $unwind: { path: '$tweet', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              type: 1,
              read: 1,
              created_at: 1,
              tweet_id: 1,
              sender: { _id: 1, name: 1, username: 1, avatar: 1 },
              // chỉ cho xem nội dung tweet nếu là tweet công khai hoặc tweet của mình
              tweet_preview: {
                $cond: [
                  {
                    $or: [{ $eq: ['$tweet.audience', TweetAudience.Everyone] }, { $eq: ['$tweet.user_id', receiver] }]
                  },
                  { $substrCP: [{ $ifNull: ['$tweet.content', ''] }, 0, 100] },
                  null
                ]
              }
            }
          }
        ] as Document[])
        .toArray(),
      databaseService.notification.countDocuments({ receiver_id: receiver }),
      databaseService.notification.countDocuments({ receiver_id: receiver, read: false })
    ])
    return { result, total, unread }
  }

  async unreadCount(user_id: string) {
    return databaseService.notification.countDocuments({ receiver_id: new ObjectId(user_id), read: false })
  }

  async markRead(user_id: string, notification_id: string) {
    await databaseService.notification.updateOne(
      { _id: new ObjectId(notification_id), receiver_id: new ObjectId(user_id) }, // đúng chủ mới được đánh dấu
      { $set: { read: true } }
    )
    return { message: 'Marked as read' }
  }

  async markAllRead(user_id: string) {
    await databaseService.notification.updateMany(
      { receiver_id: new ObjectId(user_id), read: false },
      { $set: { read: true } }
    )
    return { message: 'Marked all as read' }
  }

  async getNotifications({ user_id, page, limit }: { user_id: string; page: number; limit: number }) {
    const result = await databaseService.notification
      .aggregate([
        {
          $match: {
            receiver_id: new ObjectId(user_id)
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
            from: 'users',
            localField: 'sender_id',
            foreignField: '_id',
            as: 'sender'
          }
        },
        {
          $unwind: {
            path: '$sender'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: 'tweet_id',
            foreignField: '_id',
            as: 'tweet'
          }
        },
        {
          $unwind: {
            path: '$tweet'
          }
        },
        {
          $project: {
            _id: 1,
            type: 1,
            read: 1,
            created_at: 1,
            sender: {
              _id: 1,
              name: 1,
              username: 1,
              avatar: 1
            },
            tweet: {
              _id: 1,
              content: 1
            }
          }
        }
      ])
      .toArray()
    const total = await databaseService.notification.countDocuments({ receiver_id: new ObjectId(user_id) })
    return { result, total }
  }
}

const notificationsService = new NotificationsService()
export default notificationsService
