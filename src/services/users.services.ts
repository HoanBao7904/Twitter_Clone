import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { RegisterRequestBody, UpdateReqBody } from '~/models/requests/User.request'
import { HashPassword } from '~/utils/crypto'
import { SignToken } from '~/utils/jwt'
import { TokenTypes, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
import { httpStatus } from '~/constants/httpStatus'
import Follower from '~/models/schemas/follower.schema'
import axios from 'axios'
dotenv.config()
class UsersServices {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return SignToken({
      payload: {
        user_id,
        token_type: TokenTypes.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as '100d'
      }
    })
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return SignToken({
      payload: {
        user_id,
        token_type: TokenTypes.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as '15m'
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return SignToken({
      payload: {
        user_id,
        token_type: TokenTypes.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as '7d'
      }
    })
  }

  private signForgotpasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return SignToken({
      payload: {
        user_id,
        token_type: TokenTypes.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as '7d'
      }
    })
  }

  private SignAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async registerUser(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        username: `user${user_id.toString()}`, //default
        date_of_birth: new Date(payload.date_Of_Birth),
        password: HashPassword(payload.password)
      })
    )
    // const userid = result.insertedId.toString()
    // const [acess_token, refresh_token] = await Promise.all([
    //   this.signAccessToken(userid),
    //   this.signRefreshToken(userid)
    // ])

    const [acess_token, refresh_token] = await this.SignAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseService.refreshtokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id.toString()) })
    )
    console.log('email_verify_token', email_verify_token)
    return {
      acess_token,
      refresh_token,
      user_id
    }
  }

  async loginUser({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [acess_token, refresh_token] = await this.SignAccessAndRefreshToken({ user_id: user_id, verify: verify })
    await databaseService.refreshtokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return {
      acess_token,
      refresh_token
    }
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-from-urlencoded'
      }
    }) //defaut google requirement
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, token_id: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: { access_token: access_token, alt: 'json' },
      headers: {
        Authorization: `Bearer ${token_id}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oauth(code: string) {
    const data = await this.getOauthGoogleToken(code)
    const userinfo = await this.getGoogleUserInfo(data.access_token, data.id_token)
    if (!userinfo.verified_email) {
      throw new ErrorWithStatus({
        message: 'chua verify gmail',
        status: 400
      })
    }
    //kiem tra email duoc dki chua
    const user = await databaseService.users.findOne({ email: userinfo.email })
    if (user) {
      const [access_token, refresh_token] = await this.SignAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })

      await databaseService.refreshtokens.insertOne(
        new RefreshToken({ token: refresh_token, user_id: new ObjectId(user._id.toString()) })
      )

      return {
        access_token,
        refresh_token,
        newUser: false,
        verify: UserVerifyStatus.Verified
      }
    } else {
      const password = Math.random().toString(36).substring(2, 7)
      //khong co tao moi
      const data = await this.registerUser({
        name: userinfo.name,
        email: userinfo.email,
        date_Of_Birth: new Date().toISOString(),
        password: password,
        confirm_Password: password
      })
      return { ...data, newUser: true, verify: UserVerifyStatus.Unverified }
    }
    // console.log(userinfo)
    /**
     * {
     *   access_token:,
     *   expires_in:,
     *   refresh_token
     *   scope:,
     *   token_type:,
     *   id_token:,
     * }
     */
  }

  async CheckEmail(value: string) {
    const user = await databaseService.users.findOne({ email: value })
    return user
  }

  async logout(refresh_token: string) {
    await databaseService.refreshtokens.deleteOne({ token: refresh_token })
    // console.log('result: ', result)
    return {
      message: 'logout is success'
    }
  }

  async refershToken(user_id: string) {
    const acess_token = await this.signAccessToken({ user_id: user_id, verify: UserVerifyStatus.Verified })
    return acess_token
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.SignAccessAndRefreshToken({ user_id: user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
            // updated_at: new Date() //tạo giá trị cập nhập
          },

          $currentDate: {
            //mongoDb cập nhập giá tri date, làm cánh này commnet cái updateat chỗ set
            updated_at: true
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    await databaseService.refreshtokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id,
      verify: UserVerifyStatus.Unverified
    })
    //giả xử đây là gửi email(chưa làm chức năng này)
    console.log('email verify token: ', email_verify_token)
    //cập nhập lại giá trị email verify token trong collection user
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: 'verify is succes'
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotpasswordToken({ user_id, verify })
    console.log('forgot_password_token:', forgot_password_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    console.log('forgot_password_token :', forgot_password_token)
    return {
      message: 'check email to reset passworld'
    }
    //gui email kem duong link den nguoi dung: http://twitter.com/forgot-password?token=token
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: '',
          password: HashPassword(password),
          updated_at: new Date()
        }
      }
    )
    return {
      message: 'reset password success'
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          forgot_password_token: 0,
          email_verify_token: 0,
          password: 0
        }
      }
    )
    return user
  }
  async updateMe(user_id: string, payload: UpdateReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    // có hai lựa chọn 1 update 2 findoneandUpdate(thz này vừa update vừa trả về document mới cho user)
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username: username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: 'user not found',
        status: httpStatus.NOT_FOUND
      })
    }
    return user
  }

  async follower(user_id: string, follower_user_id: string) {
    const follower = await databaseService.follower.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(follower_user_id)
    })

    if (follower === null) {
      await databaseService.follower.insertOne(
        new Follower({
          followed_user_id: new ObjectId(follower_user_id),
          user_id: new ObjectId(user_id)
        })
      )

      return {
        message: 'follow success'
      }
    }
    return {
      message: 'Da Follower'
    }
  }

  async unFollower(user_id: string, follower_user_id: string) {
    const follower = await databaseService.follower.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(follower_user_id)
    })

    //nghĩa là nó chưa follwer user này
    if (follower === null) {
      return {
        message: 'đã un-follwer'
      }
    }
    await databaseService.follower.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(follower_user_id)
    })

    return {
      message: 'un-follower success'
    }
  }
  async ChangePassword(user_id: string, password: string) {
    const changePass = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: HashPassword(password)
        }
      }
    )

    return {
      message: 'changePassword is success'
      // changePass
    }
  }
}

const usersServices = new UsersServices()
export default usersServices
