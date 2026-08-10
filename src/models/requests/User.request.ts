import { JwtPayload } from 'jsonwebtoken'
import { TokenTypes } from '~/constants/enums'

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_Password: string
  date_Of_Birth: string
}

export interface LogoutRequestBody {
  refresh_Token: string
}

export interface Tokenpayload extends JwtPayload {
  user_id: string
  token_type: TokenTypes
}
