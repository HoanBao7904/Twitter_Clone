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
  async getNotifications({ user_id, page, limit }: { user_id: string; page: number; limit: number }) {
    const [result, total] = await Promise.all([
      databaseService.notification
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
        .toArray(),
      databaseService.notification.countDocuments({ receiver_id: new ObjectId(user_id) })
    ])

    return { result, total }
  }

  async readNotificationService(user_id: string, _id: string) {
    const result = await databaseService.notification.updateOne(
      {
        _id: new ObjectId(_id),
        receiver_id: new ObjectId(user_id),
        read: false
      },
      {
        $set: {
          read: true
        }
      }
    )

    return result
  }
}

const notificationsService = new NotificationsService()
export default notificationsService
