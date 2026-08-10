import { NextFunction, Request, Response, RequestHandler } from 'express'

export const wrapRequestHandler = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Promise.resolve(func(req, res, next)).catch(next) //canh nayfn async moi duoc
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
//hàm này dùng để bọc các hàm xử lý request (request handler) trong Express.
// Nó giúp quản lý lỗi một cách hiệu quả bằng cách bắt các lỗi phát sinh trong các hàm bất đồng bộ (async functions)
// và chuyển chúng đến middleware xử lý lỗi (error handling middleware).
// có nghĩa không cần phải viết try-catch trong từng hàm xử lý request nữa, mà chỉ cần bọc hàm đó bằng wrapRequestHandler.
