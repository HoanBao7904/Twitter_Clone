import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { RegisterRequestBody } from '~/models/requests/User.request'
import { HashPassword } from '~/utils/crypto'
import { SignToken } from '~/utils/jwt'
import { TokenTypes } from '~/constants/enums'

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
  async registerUser(payload: RegisterRequestBody) {
    // const { email, password } = payload
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_Of_Birth),
        password: HashPassword(payload.password)
      })
    )
    const userid = result.insertedId.toString()
    const [acess_token, refresh_token] = await Promise.all([
      this.signAccessToken(userid),
      this.signRefreshToken(userid)
    ])
    return {
      acess_token,
      refresh_token,
      userid
    }
  }

  async CheckEmail(value: string) {
    const user = await databaseService.users.findOne({ email: value })
    return user
  }
}

const usersServices = new UsersServices()
export default usersServices
