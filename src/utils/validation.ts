import express from 'express'
import { body, ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { httpStatus } from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// can be reused by many routes
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validations.run(req)
    //nói cánh dễ hiểu thì nó sẽ chạy các rule trong validation chain và lưu kết quả vào req object,
    // nếu có lỗi thì nó sẽ lưu vào req object, nếu không có lỗi thì nó sẽ không làm gì cả
    const errors = validationResult(req)
    // nếu có lỗi thì nó sẽ trả về lỗi cho client
    if (errors.isEmpty()) {
      return next()
    }
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ error: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.error[key] = errorsObject[key]
      console.log(`entityError.error[key]:`, entityError.error[key])
    }

    console.log(errors)
    // dòng này sẽ kiểm tra xem có lỗi hay không,
    // nếu không có lỗi thì nó sẽ gọi next() để tiếp tục chạy middleware tiếp theo,

    next(entityError)
    // res.status(422).json({ errors: errorsObject })
  }
}
