import { config } from 'dotenv'
import argv from 'minimist'
import { StringValue } from 'ms'
const options = argv(process.argv.slice(2))
export const isProduction = options.env === 'production'

config({
  path: options.env ? `.env.${options.env}` : '.env'
})

export const envConfig = {
  awsRegion: process.env.AWS_REGION as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsaccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  sesFromAddress: process.env.SES_FROM_ADDRESS as string,
  port: process.env.PORT as string,
  clientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBACK as string,
  jwtScretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  dbName: process.env.DB_NAME as string,
  dbUserName: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbUserCollection: process.env.DB_USERS_COLLECTION as string,
  dbTweetsCollection: process.env.DB_TWEETS_COLLECTION as string,
  dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  dbFollowerCollection: process.env.DB_FOLLOWER_COLLECTION as string,
  dbHashtagCollection: process.env.DB_HASHTAG_COLLECTION as string,
  dbBookmarkCollection: process.env.DB_BOOKMARK_COLLECTION as string,
  dbLikeCollection: process.env.DB_LIKE_COLLECTION as string,
  dbConversationCollection: process.env.DB_CONVERSATION_COLLECTION as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as StringValue,
  fogotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as StringValue,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  passwordSecret: process.env.PASSWORD_SECRET as string,
  clientUrl: process.env.CLIENT_URL as string
}

export const uri = `mongodb+srv://${envConfig.dbName}:${envConfig.dbPassword}@cluster0.50lsru5.mongodb.net/?appName=Cluster0`
// export const isProduction = Boolean(options.production)
