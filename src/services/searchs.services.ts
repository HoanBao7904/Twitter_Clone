import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { MediaType, MediaTypeQuery, PeopleFollowQuery, TweetType } from '~/constants/enums'

class SearchService {
  async search({
    content,
    limit,
    page,
    user_id,
    media_type,
    people_follow
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type?: MediaTypeQuery
    people_follow?: PeopleFollowQuery
  }) {
    // const result = await databaseService.tweets
    //   .find({ $text: { $search: content } })
    //   .skip(limit * (page - 1))
    //   .limit(limit)
    //   .toArray()

    const match: any = {
      $text: {
        $search: content
      }
    }
    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        match['medias.type'] = MediaType.Image
      }
      if (media_type === MediaTypeQuery.Video) {
        match['medias.type'] = MediaType.Video
      }
    }

    if (people_follow && people_follow === PeopleFollowQuery.following) {
      const user_id_owner = new ObjectId(user_id)
      const followed_user_ids = await databaseService.follower
        .find(
          { user_id: user_id_owner },
          {
            projection: {
              followed_user_id: 1,
              _id: 0
            }
          }
        )
        .toArray()

      const ids = followed_user_ids.map((item) => {
        return item.followed_user_id
      })

      ids.push(user_id_owner)

      match['user_id'] = {
        $in: ids
      }

      // console.log(ids)
    }

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
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
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                date_of_birth: 0,
                twitter_circle: 0
              }
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    // const result = await databaseService.tweets
    //   .aggregate([
    //     {
    //       $match: {
    //         $text: {
    //           $search: content
    //         }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'user_id',
    //         foreignField: '_id',
    //         as: 'user'
    //       }
    //     },
    //     {
    //       $unwind: {
    //         path: '$user'
    //       }
    //     },
    //     {
    //       $match: {
    //         $or: [
    //           {
    //             audience: 0
    //           },
    //           {
    //             $and: [
    //               {
    //                 audience: 1
    //               },
    //               {
    //                 'user.twitter_circle': {
    //                   $in: [new ObjectId(user_id)]
    //                 }
    //               }
    //             ]
    //           }
    //         ]
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'hashtags',
    //         localField: 'hashtags',
    //         foreignField: '_id',
    //         as: 'hashtags'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'mentions',
    //         foreignField: '_id',
    //         as: 'mentions'
    //       }
    //     },
    //     {
    //       $addFields: {
    //         mentions: {
    //           $map: {
    //             input: '$mentions',
    //             as: 'mention',
    //             in: {
    //               _id: '$$mention._id',
    //               name: '$$mention.name',
    //               username: '$$mention.username',
    //               email: '$$mention.email'
    //             }
    //           }
    //         }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'bookmarks',
    //         localField: '_id',
    //         foreignField: 'tweet_id',
    //         as: 'bookmarks'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'likes',
    //         localField: '_id',
    //         foreignField: 'tweet_id',
    //         as: 'likes'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'tweets',
    //         localField: '_id',
    //         foreignField: 'parent_id',
    //         as: 'tweet_children'
    //       }
    //     },
    //     {
    //       $addFields: {
    //         bookmarks: {
    //           $size: '$bookmarks'
    //         },
    //         likes: {
    //           $size: '$likes'
    //         },
    //         retweetCount: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'children',
    //               cond: {
    //                 $eq: ['$$children.type', TweetType.Retweet]
    //               }
    //             }
    //           }
    //         },
    //         CommentCount: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'children',
    //               cond: {
    //                 $eq: ['$$children.type', TweetType.Comment]
    //               }
    //             }
    //           }
    //         },
    //         QuoteCount: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'children',
    //               cond: {
    //                 $eq: ['$$children.type', TweetType.QuoteTweet]
    //               }
    //             }
    //           }
    //         }
    //       }
    //     },
    //     {
    //       $project: {
    //         tweet_children: 0,
    //         user: {
    //           password: 0,
    //           email_verify_token: 0,
    //           forgot_password_token: 0,
    //           date_of_birth: 0,
    //           twitter_circle: 0
    //         }
    //       }
    //     },
    //     {
    //       $skip: limit * (page - 1)
    //     },
    //     {
    //       $limit: limit
    //     }
    //   ])
    //   .toArray()

    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })

    return {
      tweets,
      // total: total[0].total
      total: total[0]?.total || 0
    }
  }
}

const searchService = new SearchService()

export default searchService
