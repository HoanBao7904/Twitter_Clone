import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import { httpStatus } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import Tweet from '~/models/schemas/Twitter.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const tweetsType = numberEnumToArray(TweetType)
const tweetsAudience = numberEnumToArray(TweetAudience)
const mediasType = numberEnumToArray(MediaType)

export const createtweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetsType],
        errorMessage: 'invalid type'
      }
    },
    audience: {
      isIn: {
        options: [tweetsAudience],
        errorMessage: 'invalid audience'
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // - Nếu `type` là retweet, comment, quotetweet thì `parent_id` phải là `tweet_id` của tweet cha
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error('"parent_id phải là tweet_id của tweet cha"')
          }
          // nếu `type` là tweet thì `parent_id` phải là `null`
          if (TweetType.Tweet && value !== null) {
            throw new Error('parent_id phải là null khi type là tweet')
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashTags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          // Nếu `type` là comment, quotetweet, tweet và không có `mentions` và `hashtags` thì `content` phải là string và không được rỗng.
          if (
            [TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            isEmpty(mentions) &&
            isEmpty(hashTags) &&
            value === ''
          ) {
            throw new Error('Content phải là một chuỗi và không được để trống khi không có mentions hoặc hashtags')
          }
          //  Nếu `type` là retweet thì `content` phải là `''`
          // if (TweetType.Retweet && value !== '') {
          //   throw new Error('Content phải là chuỗi rỗng khi type là retweet')
          // }
          if (type === TweetType.Retweet && value !== '') {
            throw new Error('Content phải là chuỗi rỗng khi type là retweet')
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //yêu cầu phải là value kiểu string
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error('Hashtags phải là một mảng các string')
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //yêu cầu phải là value kiểu user_id
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error('Mentions phải là một mảng có dạng user_id')
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      //`medias` phải là mảng các `Media`
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => typeof item.url === 'string' || mediasType.includes(item.type))) {
            throw new Error('Medias phải là một mảng các Media')
          }
          return true
        }
      }
    }
  })
)

export const tweetIdvalidator = validate(
  checkSchema({
    tweet_id: {
      // isMongoId: {
      //   errorMessage: 'invalid tweet id'
      // },
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              message: 'invalid tweetId',
              status: 400
            })
          }

          // const tweet_id = await databaseService.tweets.findOne({
          //   _id: new ObjectId(value)
          // })

          const tweet_id = (
            await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_children'
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: '$bookmarks'
                    },
                    likes: {
                      $size: '$likes'
                    },
                    retweetCount: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'children',
                          cond: {
                            $eq: ['$$children.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    CommentCount: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'children',
                          cond: {
                            $eq: ['$$children.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    QuoteCount: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'children',
                          cond: {
                            $eq: ['$$children.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    }
                  }
                }
              ])
              .toArray()
          )[0] //lấy thz đầu tiên
          console.log(tweet_id)
          if (!tweet_id) {
            throw new ErrorWithStatus({
              message: 'not found',
              status: 404
            })
          }
          ;(req as Request).tweet = tweet_id
          return true
        }
      }
    }
  })
)

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetsType],
          errorMessage: 'Invalid type'
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            console.log(num)
            if (num <= 1 || num >= 100) {
              throw new Error('limit >= 1 && limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

// export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
//   const tweet = req.tweet as Tweet
//   if (tweet.audience === TweetAudience.TwitterCircle) {
//     //kiểm tra người xem tweet này login chưa

//     if (!req.decoded_authorization) {
//       throw new ErrorWithStatus({
//         message: 'User not Login',
//         status: httpStatus.UNAUTHORIZED
//       })
//     }
//     //kiểm tra tài khoản tác giả có bị khóa hay chưa
//     const athor = await databaseService.users.findOne({ _id: tweet.user_id })
//     if (!athor || athor.verify === UserVerifyStatus.Banned) {
//       throw new ErrorWithStatus({
//         message: 'not found',
//         status: 404
//       })
//     }
//     //kiểm tra người xem tweet có trong tweet circle của tác giả hay không
//     const { user_id } = req.decoded_authorization
//     const isInTweetcircle = (athor.twitter_circle || []).some((user_id_circle) => user_id_circle.equals(user_id))
//     //nếu bạn không phải là tác giả và không nằm trong danh sách tweet circle thì lỗi
//     if (!athor._id.equals(user_id) && !isInTweetcircle) {
//       throw new ErrorWithStatus({
//         message: 'tweet is not public',
//         status: 403
//       })
//     }

//     next()
//   }
// }

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiểm tra người xem tweet này đã đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: httpStatus.UNAUTHORIZED,
        message: 'User not Login'
      })
    }
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    // Kiểm tra tài khoản tác giả có ổn (bị khóa hay bị xóa chưa) không
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: 404,
        message: 'not found'
      })
    }
    // Kiểm tra người xem tweet này có trong Twitter Circle của tác giả hay không
    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = (author.twitter_circle || []).some((user_circle_id) => user_circle_id.equals(user_id))
    // Nếu bạn không phải là tác giả và không nằm trong twitter circle thì quăng lỗi
    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        status: 403,
        message: 'tweet is not public'
      })
    }
  }
  next()
})

export const panigationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            console.log(num)
            if (num <= 1 || num >= 100) {
              throw new Error('limit >= 1 && limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
