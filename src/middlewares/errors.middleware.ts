import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import { httpStatus } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

function safeStringify(obj: any) {
  const seen = new WeakSet()
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]'
        seen.add(value)
      }
      return value
    })
  )
}

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.status || httpStatus.INTERNAL_SERVER_EROR).json(omit(err, ['status']))
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  res.status(httpStatus.INTERNAL_SERVER_EROR).json({
    message: err.message,
    errorInfo: safeStringify(omit(err, ['stack']))
  })
}
