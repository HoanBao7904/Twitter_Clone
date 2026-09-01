import { MongoClient, Db, Collection } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schemas'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import Tweet from '~/models/schemas/Twitter.schema'
import Follower from '~/models/schemas/follower.schema'
import HashTag from '~/models/schemas/Hashtag.schema'
import BookMark from '~/models/schemas/BookMark.schema'
import Like from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversation.schema'
dotenv.config()
// console.log(process.env.DB_USERNAME)
// console.log(process.env.DB_PASSWORD)
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.50lsru5.mongodb.net/?appName=Cluster0`

// const client = new MongoClient(uri)

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('error', error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }

  get refreshtokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
  get follower(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWER_COLLECTION as string)
  }

  get hashtag(): Collection<HashTag> {
    return this.db.collection(process.env.DB_HASHTAG_COLLECTION as string)
  }

  get bookmark(): Collection<BookMark> {
    return this.db.collection(process.env.DB_BOOKMARK_COLLECTION as string)
  }

  get like(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKE_COLLECTION as string)
  }

  get converSation(): Collection<Conversation> {
    return this.db.collection(process.env.DB_CONVERSATION_COLLECTION as string)
  }
}

//taoj obj tu class dataservices
const databaseService = new DatabaseService()

export default databaseService
