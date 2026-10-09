import { MongoClient, Db, Collection } from 'mongodb'
// import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import Tweet from '~/models/schemas/Twitter.schema'
import Follower from '~/models/schemas/Follower.schema'
import HashTag from '~/models/schemas/Hashtag.schema'
import BookMark from '~/models/schemas/BookMark.schema'
import Like from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import { envConfig } from '~/constants/config'
// dotenv.config()
// console.log(process.env.DB_USERNAME)
// console.log(process.env.DB_PASSWORD)
export const uri = `mongodb+srv://${envConfig.dbUserName}:${envConfig.dbPassword}@cluster0.50lsru5.mongodb.net/?appName=Cluster0`
// const client = new MongoClient(uri)

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
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

  async indexUser() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      await this.users.createIndex({
        email: 1,
        password: 1
      })

      await this.users.createIndex({ email: 1 }, { unique: true })

      await this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const exists = await this.refreshtokens.indexExists(['token_1', 'exp_1'])

    if (!exists) {
      await this.refreshtokens.createIndex({
        token: 1
      })

      await this.refreshtokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexFollowers() {
    const exists = await this.follower.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      await this.follower.createIndex({
        user_id: 1,
        followed_user_id: 1
      })
    }
  }

  async indexTweets() {
    const exists = await this.tweets.indexExists('content_text')

    if (!exists) {
      await this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUserCollection)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection)
  }

  get refreshtokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection)
  }
  get follower(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowerCollection)
  }

  get hashtag(): Collection<HashTag> {
    return this.db.collection(envConfig.dbHashtagCollection)
  }

  get bookmark(): Collection<BookMark> {
    return this.db.collection(envConfig.dbBookmarkCollection)
  }

  get like(): Collection<Like> {
    return this.db.collection(envConfig.dbLikeCollection)
  }

  get converSation(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationCollection)
  }
}

//taoj obj tu class dataservices
const databaseService = new DatabaseService()

export default databaseService
