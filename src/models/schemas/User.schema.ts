import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'

/**
 * @openapi
 * components:
 *   schemas:
 *     loginBody:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: 'Email đăng nhập'
 *           example: 'nguyenhoanbao4+2@gmail.com'
 *         password:
 *           type: string
 *           description: 'Mật khẩu đăng nhập'
 *           example: 'HoanBao7904@'

 *     successAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           description: 'Access token dùng cho xác thực API'
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *         refresh_token:
 *           type: string
 *           description: 'Refresh token dùng để cấp lại Access token'
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

 *     userVerifyStatus:
 *       type: number
 *       description: 'Trạng thái xác thực tài khoản: 0 (Unverified), 1 (Verified), 2 (Banned)'
 *       enum: [Unverified, Verified, Banned]
 *       example: 1

 *     user:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 'ID duy nhất của user (MongoDB ObjectId)'
 *           example: '6a8d7baab84fc9ffa0bd9a89'
 *         name:
 *           type: string
 *           description: 'Tên hiển thị'
 *           example: 'baonguyendev'
 *         email:
 *           type: string
 *           description: 'Địa chỉ email'
 *           example: 'nguyenhoanbao4+2@gmail.com'
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *           description: 'Ngày sinh (ISO 8601)'
 *           example: '2026-08-25T10:56:26.846Z'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 'Thời gian tạo tài khoản'
 *           example: '2026-08-25T11:25:30.020Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 'Thời gian cập nhật lần cuối'
 *           example: '2026-08-25T11:25:30.020Z'
 *         verify:
 *           $ref: '#/components/schemas/userVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           description: 'Danh sách user_id trong Twitter Circle'
 *           items:
 *             type: string
 *           example: ['6a8d7baab84fc9ffa0bd9a89', '6a8d7baab84fc9ffa0bd9a90']
 *         bio:
 *           type: string
 *           description: 'Tiểu sử'
 *           example: ''
 *         location:
 *           type: string
 *           description: 'Vị trí'
 *           example: 'Da Nang, Viet Nam'
 *         website:
 *           type: string
 *           description: 'Trang web cá nhân'
 *           example: 'https://example.com'
 *         username:
 *           type: string
 *           description: 'Username duy nhất'
 *           example: 'user6a8d7baab84fc9ffa0bd9a89'
 *         avatar:
 *           type: string
 *           description: 'Đường dẫn ảnh đại diện'
 *           example: 'http://localhost:4000/images/avatar/6a8d7baab84fc9ffa0bd9a89.png'
 *         cover_photo:
 *           type: string
 *           description: 'Đường dẫn ảnh bìa'
 *           example: 'http://localhost:4000/images/cover_photo/6a8d7baab84fc9ffa0bd9a89.png'


 */
interface UserType {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus
  twitter_circle?: ObjectId[] // danh sách id người mà user này thêm vào cỉcle
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token: string // jwt hoặc '' nếu đã xác thực email
  verify: UserVerifyStatus
  twitter_circle: ObjectId[]
  bio: string // optional
  location: string // optional
  website: string // optional
  username: string // optional
  avatar: string // optional
  cover_photo: string // optional
  constructor(user: UserType) {
    const data = new Date()
    this._id = user._id || new ObjectId()
    this.name = user.name || ''
    this.email = user.email || ''
    this.date_of_birth = user.date_of_birth || new Date()
    this.password = user.password || ''
    this.created_at = user.created_at || data
    this.updated_at = user.updated_at || data
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.twitter_circle = user.twitter_circle || []
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }
}
