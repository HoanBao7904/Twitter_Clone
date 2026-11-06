import { TweetRequestBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Twitter.schema'
import { Document, ObjectId, WithId } from 'mongodb'
import HashTag from '~/models/schemas/Hashtag.schema'
import { TweetAudience, TweetType } from '~/constants/enums'
class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    //tìm hashtag trong db, nếu có thì lấy, không thì tạo mới
    const hashtagDocuemts = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtag.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new HashTag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuemts.map((hashtag) => (hashtag.value as WithId<HashTag>)._id)
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtags as ObjectId[], //chỗ này chưa làm tạm thời để trống
        medias: body.medias,
        mentions: body.mentions,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )

    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return result.value as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }

  async getTweerChilrdren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id: string
  }) {
    const tweetsComent = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
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
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1) //công thức phân trang
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const ids = tweetsComent.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids //tìm những id nào có trong ids
          }
        },
        {
          $inc: inc, // tăng view
          $set: {
            updated_at: new Date()
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    //databaseService.tweets.updateMany thz này ko return về nên phải làm cánh forech hoặc dán lại code aggregate
    tweetsComent.forEach((item) => {
      item.updated_at = new Date()
      if (item.user_id) {
        item.user_views += 1
      } else {
        item.guest_views += 1
      }
    })

    return { tweetsComent, total }
  }

  async getTrendingRandomTweets(limit: number, page: number) {
    // lấy tweets từ 30 ngày trước
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30)

    return databaseService.tweets
      .aggregate([
        {
          $match: {
            audience: TweetAudience.Everyone,
            created_at: { $gte: sevenDaysAgo }
          }
        },
        // 1. Lấy Like
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        // 2. Lấy Bookmark
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        // 3. Lấy Comment (Reply)
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        // 4. TÍNH ĐIỂM TRENDING (SCORE)
        {
          $addFields: {
            like_count: { $size: '$likes' },
            bookmark_count: { $size: '$bookmarks' },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'child',
                  cond: { $eq: ['$$child.type', TweetType.Comment] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            // Công thức: Like (3đ) + Bookmark (2đ) + Comment (2đ) + View (0.1đ)
            // Bạn có thể tự điều chỉnh hệ số này
            trending_score: {
              $add: [
                { $multiply: ['$like_count', 3] },
                { $multiply: ['$bookmark_count', 2] },
                { $multiply: ['$comment_count', 2] },
                { $multiply: ['$user_views', 0.1] }
              ]
            }
          }
        },
        // 5. Xóa dữ liệu rác trước khi Sort để MongoDB chạy nhanh hơn
        {
          $project: {
            likes: 0,
            bookmarks: 0,
            tweet_children: 0
          }
        },
        // 6. Sắp xếp theo Điểm Trending
        {
          $sort: { trending_score: -1, created_at: -1 }
        },
        // 7. Phân trang & Lấy tác giả
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'authors'
          }
        },
        { $unwind: { path: '$authors' } },
        {
          $addFields: {
            author: {
              _id: '$authors._id',
              name: '$authors.name',
              username: '$authors.username',
              avatar: '$authors.avatar'
            }
          }
        },
        {
          $project: {
            authors: 0
          }
        }
      ])
      .toArray()
  }

  async getnewFeeds({ user_id, page, limit }: { user_id: string; page: number; limit: number }) {
    const user_id_obj = new ObjectId(user_id)

    // 1. Lấy danh sách những người mình đang follow
    const followed_users = await databaseService.follower
      .find({ user_id: user_id_obj }, { projection: { followed_user_id: 1, _id: 0 } })
      .toArray()

    // Hàm phụ trợ để tăng view hàng loạt và cập nhật data trả về
    const handleTweetsViews = async (tweets: Document[]) => {
      if (tweets.length === 0) return
      const ids = tweets.map((tweet) => tweet._id as ObjectId)

      await databaseService.tweets.updateMany(
        //nếu tweets có id nào trong ids thì tăng view và cập nhật updated_at
        { _id: { $in: ids } },
        { $inc: { user_views: 1 }, $set: { updated_at: new Date() } }
      )

      // Vì updateMany không trả về data mới, ta phải tự cộng view vào object để trả về Frontend
      tweets.forEach((tweet) => {
        tweet.user_views += 1
        tweet.updated_at = new Date()
      })
    }

    // ==========================================
    // NHÁNH 1: NẾU CHƯA FOLLOW AI (TRENDING)
    // ==========================================
    if (followed_users.length === 0) {
      // Lấy danh sách trending (hàm này đã có $skip và $limit bên trong)
      const trendingTweets = await this.getTrendingRandomTweets(limit, page)

      // Tăng view hàng loạt
      await handleTweetsViews(trendingTweets)

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const total = await databaseService.tweets.countDocuments({
        audience: TweetAudience.Everyone,
        created_at: { $gte: thirtyDaysAgo }
      })

      return { tweets: trendingTweets, total }
    }

    // ==========================================
    // NHÁNH 2: NẾU ĐÃ FOLLOW AI (FEED BÌNH THƯỜNG)
    // ==========================================
    const ids = followed_users.map((item) => item.followed_user_id)
    ids.push(user_id_obj) // Thêm chính mình vào

    const matchStage = { user_id: { $in: ids } }
    const audienceStage = {
      $match: {
        $or: [
          { audience: TweetAudience.Everyone },
          {
            $and: [{ audience: TweetAudience.TwitterCircle }, { 'user.twitter_circle': { $in: [user_id_obj] } }]
          }
        ]
      }
    }

    const [tweets, totalResult] = await Promise.all([
      databaseService.tweets
        .aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: { path: '$user' } },
          audienceStage,
          { $skip: limit * (page - 1) },
          { $limit: limit },
          { $lookup: { from: 'hashtags', localField: 'hashtags', foreignField: '_id', as: 'hashtags' } },
          { $lookup: { from: 'users', localField: 'mentions', foreignField: '_id', as: 'mentions' } },
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
          { $lookup: { from: 'bookmarks', localField: '_id', foreignField: 'tweet_id', as: 'bookmarks' } },
          { $lookup: { from: 'likes', localField: '_id', foreignField: 'tweet_id', as: 'likes' } },
          { $lookup: { from: 'tweets', localField: '_id', foreignField: 'parent_id', as: 'tweet_children' } },
          {
            $addFields: {
              bookmarks: { $size: '$bookmarks' },
              likes: { $size: '$likes' },
              retweetCount: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: { $eq: ['$$children.type', TweetType.Retweet] }
                  }
                }
              },
              CommentCount: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: { $eq: ['$$children.type', TweetType.Comment] }
                  }
                }
              },
              QuoteCount: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: { $eq: ['$$children.type', TweetType.QuoteTweet] }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              'user.password': 0,
              'user.email': 0,
              'user.email_verify_token': 0,
              'user.forgot_password_token': 0,
              'user.date_of_birth': 0,
              'user.twitter_circle': 0
            }
          }
        ])
        .toArray(),

      // Đếm tổng số bài
      databaseService.tweets
        .aggregate([
          { $match: matchStage },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
          { $unwind: { path: '$user' } },
          audienceStage,
          { $count: 'total' } // đếm kết quả trả về và đặt tên trường là total
        ])
        .toArray()
      // kết quả trả về [ { total: 3 } ]
    ])

    // Tăng view hàng loạt cho nhánh 2
    await handleTweetsViews(tweets)

    return {
      tweets,
      total: totalResult[0]?.total || 0
      //// kết quả trả về [ { total: 3 } ] nên
    }
  }
}

const tweetsServices = new TweetsService()
export default tweetsServices
