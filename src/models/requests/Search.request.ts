import { MediaTypeQuery, PeopleFollowQuery } from '~/constants/enums'
import { PaginationQuery } from './Tweet.request'

export interface searchquery extends PaginationQuery {
  content: string
  media_type?: MediaTypeQuery
  people_follow?: PeopleFollowQuery
}
