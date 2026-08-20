import { ObjectId } from 'mongodb'

interface hashtagType {
  _id?: ObjectId
  name: string
  created_at?: Date
}

export default class HashTag {
  _id?: ObjectId
  name: string
  created_at: Date
  constructor({ _id, name, created_at }: hashtagType) {
    // lí do là vì dùng "findoneAndupdateone", nó khác insert là tự tạo id còn thz này thì ko tự tạo nên gán một id cho nó
    this._id = _id || new ObjectId()
    this.name = name
    this.created_at = created_at || new Date()
  }
}
