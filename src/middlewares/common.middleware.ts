import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type FilterKey<T> = Array<keyof T> //nghia la tao mang lay Key la cua thz T

export const filterMiddleware =
  <T>(filterKey: FilterKey<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKey)
    next()
  }
