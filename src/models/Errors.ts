// type ErrorTypes = Record<string, string> // { [key:sring]: string }

import { httpStatus } from '~/constants/httpStatus'
import { user_messages } from '~/constants/messages'

type ErrorTypes = Record<
  string,
  {
    msg: string
    [key: string]: any //ngoài ra còn có thể có các thuộc tính khác, nhưng không biết trước được nên dùng [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  error: ErrorTypes
  constructor({ message = user_messages.VALIDATION_ERROR, error }: { message?: string; error: ErrorTypes }) {
    //vì biết trước status là 422 nên không cần truyền vào nữa, chỉ cần truyền message và error thôi
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.error = error
  }
}
