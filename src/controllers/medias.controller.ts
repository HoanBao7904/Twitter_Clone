import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { SendFileError } from '~/models/requests/User.request'
import mediaService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'
// import { handleUploadSingleImage } from '~/utils/file'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.handleUploadImage(req)
  // console.log(data)
  return res.json({
    message: 'upload success',
    result: url
  })
}
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.handleUploadVideo(req)
  // console.log(data)
  return res.json({
    message: 'upload success',
    result: url
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  console.log('image', name)
  return res.sendFile(path.resolve(UPLOAD_IMAGE_TEMP_DIR, name as string), (err) => {
    if (err) {
      const error = err as unknown as SendFileError
      res.status(error.status).json({
        message: 'upload file eror',
        status: error.status
      })
    }
  })
}

// export const serveVideoController = (req: Request, res: Response) => {
//   const { name } = req.params

//   return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name as string), (err) => {
//     if (err) {
//       const error = err as any
//       res.status(error.status).json({
//         message: 'upload file eror',
//         status: error.status
//       })
//     }
//   })
// }

// Client tự động gửi header Range để xin từng đoạn nhỏ của video (không xin nguyên file)
// -> Server chỉ đọc đúng đoạn đó từ ổ đĩa (fs.createReadStream start-end) và trả về 206 Partial Content
// -> Video phát được ngay từ đoạn đầu, tua tới đâu thì xin đúng đoạn đó, không cần tải hết file

export const serveVideoStreamController = (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) return res.status(400).send('requires Range header')
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name as string) // lay duong dan

  //1MB = 10^6 bytes (tính theo hệ 10, đây là thứ hay thấy trên UI)
  //còn tính theo hệ nhị phân thì 1MB = 2^20 bytes  (1024 * 1024)

  //dung lượng video (bytes)

  const videoSize = fs.statSync(videoPath).size

  //dung lượng video cho môi phân đoạn strem

  const chunkSize = 10 ** 6
  //lấy giá tri bytes bắt đầu từ header range(bytes=215547904-216006655)

  // const start = Number(range.replace(/\D/g, ''))
  // // (xóa hết ký tự không phải số, giữ lại số)
  // const end = Math.min(start + chunkSize, videoSize)
  // //lấy giá trị byte kết thúc, vượt quá dung lượng video lấy videoSize

  // //dung lượng thực tế cho mỗi đoạn video stream
  // //thường đây sẽ là chunkSize, ngoại trừ đoạn cuối
  // const contentLength = end - start

  const start = Number(range.replace(/bytes=/, '').split('-')[0])
  const end = Math.min(start + chunkSize - 1, videoSize - 1) // trừ 1
  const contentLength = end - start + 1 // cộng 1 lại

  const contentType = mime.getType(videoPath) || 'video/*'

  /**
   * Format của header Content-Range: bytes <start>-<end>/<videoSize>
   * Ví dụ: Content-Range: bytes 1048576-3145727/3145728
   * Yêu cầu là `end` phải luôn luôn nhỏ hơn `videoSize`
   * ❌ 'Content-Range': 'bytes 0-100/100'
   * ✅ 'Content-Range': 'bytes 0-99/100'
   *
   * Còn Content-Length sẽ là end - start + 1. Đại diện cho khoản cách.
   * Để dễ hình dung, mọi người tưởng tượng từ số 0 đến số 10 thì ta có 11 số.
   * byte cũng tương tự, nếu start = 0, end = 10 thì ta có 11 byte.
   * Công thức là end - start + 1
   *
   * ChunkSize = 50
   * videoSize = 100
   * |0----------------50|51----------------99|100 (end)
   * stream 1: start = 0, end = 50, contentLength = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   */

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(206, headers)
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}
