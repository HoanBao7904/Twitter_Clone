export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum TokenTypes {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}

export enum PeopleFollowQuery {
  Everyone = 'false', // 0
  following = 'true' // 1
}

export enum NotificationType {
  LIKE = 'LIKE', // Ai đó thích Tweet của bạn
  BOOKMARK = 'BOOKMARK', // Ai đó đánh dấu Tweet của bạn
  COMMENT = 'COMMENT', // Ai đó bình luận vào Tweet của bạn
  RETWEET = 'RETWEET', // Ai đó Retweet bài của bạn
  QUOTE_TWEET = 'QUOTE_TWEET', // Ai đó Quoted Tweet của bạn
  FOLLOW = 'FOLLOW', // Ai đó bắt đầu follow bạn
  MENTION = 'MENTION' // Ai đó nhắc đến bạn (@username) trong Tweet
}
