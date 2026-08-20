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
}

const bookMarksService = new BookMarksService()
export default bookMarksService
