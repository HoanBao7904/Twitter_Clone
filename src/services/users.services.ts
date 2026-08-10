import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { RegisterRequestBody } from '~/models/requests/User.request'
import { HashPassword } from '~/utils/crypto'
import { SignToken } from '~/utils/jwt'
import { TokenTypes } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()
class UsersServices {
  private signAccessToken(user_id: string) {
    return SignToken({
      payload: {
        user_id,
        token_type: TokenTypes.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as '100d'
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return SignToken({
      payload: {
        user_id,
        token_type: TokenTypes.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as '15m'
      }
    })
  }

  private SignAccessAndRefreshToken(userid: string) {
    return Promise.all([this.signAccessToken(userid), this.signRefreshToken(userid)])
  }

  async registerUser(payload: RegisterRequestBody) {
    const { name } = payload
    console.log(`name:${name}`)
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_Of_Birth),
        password: HashPassword(payload.password)
      })
    )
    const userid = result.insertedId.toString()
    // const [acess_token, refresh_token] = await Promise.all([
    //   this.signAccessToken(userid),
    //   this.signRefreshToken(userid)
    // ])

    const [acess_token, refresh_token] = await this.SignAccessAndRefreshToken(userid)

    await databaseService.refreshtokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(userid) })
    )
    return {
      acess_token,
      refresh_token,
      userid
    }
  }

  async loginUser(user_id: string) {
    const [acess_token, refresh_token] = await this.SignAccessAndRefreshToken(user_id)
    await databaseService.refreshtokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return {
      acess_token,
      refresh_token
    }
  }

  async CheckEmail(value: string) {
    const user = await databaseService.users.findOne({ email: value })
    return user
  }
}

const usersServices = new UsersServices()
export default usersServices
