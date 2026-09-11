import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeopleFollowQuery } from '~/constants/enums'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema({
    content: {
      isString: {
        errorMessage: 'content phai la string'
      }
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)],
        errorMessage: 'people_follow is value image or video'
      }
    },
    people_follow: {
      optional: true,
      isIn: {
        options: [Object.values(PeopleFollowQuery)],
        errorMessage: 'people_follow is value true or false'
      }
    }
  })
)
