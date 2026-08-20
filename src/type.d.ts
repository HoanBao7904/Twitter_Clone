import User from './models/schemas/User.schemas'
import { Tokenpayload } from './models/requests/User.request'
import Tweet from './models/schemas/Twitter.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: Tokenpayload
    decoded_refresh_token?: Tokenpayload
    decoded_email_verify_token?: Tokenpayload
    decoded_forgot_passworld_token?: Tokenpayload
    tweet?: Tweet
  }
}
