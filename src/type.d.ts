import User from './models/schemas/User.schemas'
import { Tokenpayload } from './models/requests/User.request'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: Tokenpayload
    decoded_refresh_token?: Tokenpayload
  }
}
