import express from 'express'
import { body, ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'

// can be reused by many routes
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validations.run(req)
    //nói cánh dễ hiểu thì nó sẽ chạy các rule trong validation chain và lưu kết quả vào req object,
    // nếu có lỗi thì nó sẽ lưu vào req object, nếu không có lỗi thì nó sẽ không làm gì cả
    const errors = validationResult(req)
    // dòng này sẽ kiểm tra xem có lỗi hay không,
    // nếu không có lỗi thì nó sẽ gọi next() để tiếp tục chạy middleware tiếp theo,
    // nếu có lỗi thì nó sẽ trả về lỗi cho client
    if (errors.isEmpty()) {
      return next()
    }
    res.status(400).json({ errors: errors.array() })
  }
}
