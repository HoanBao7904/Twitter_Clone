import { ObjectId } from 'mongodb'
import { NotificationType } from '~/constants/enums'

export interface INotification {
  _id?: ObjectId
  sender_id: ObjectId // Người thực hiện hành động (User A)
  receiver_id: ObjectId // Người nhận thông báo (User B - chủ sở hữu Tweet hoặc người được follow)
  type: NotificationType // Loại thông báo
  tweet_id?: ObjectId // Tweet liên quan (null nếu là hành động FOLLOW)
  read?: boolean // Trạng thái đã đọc hay chưa (default: false)
  created_at?: Date
}

export default class Notification {
  _id?: ObjectId
  sender_id: ObjectId // Người thực hiện hành động (User A)
  receiver_id: ObjectId // Người nhận thông báo (User B - chủ sở hữu Tweet hoặc người được follow)
  type: NotificationType // Loại thông báo
  tweet_id?: ObjectId // Tweet liên quan (null nếu là hành động FOLLOW)
  read?: boolean // Trạng thái đã đọc hay chưa (default: false)
  created_at?: Date

  constructor({ _id, sender_id, receiver_id, type, tweet_id, read, created_at }: INotification) {
    this._id = _id
    this.sender_id = sender_id
    this.receiver_id = receiver_id
    this.type = type
    this.tweet_id = tweet_id
    this.read = read || false
    this.created_at = created_at || new Date()
  }
}
