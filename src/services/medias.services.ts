import { Request } from 'express'
// import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
// import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
// import { isProduction } from '~/constants/config'
import { config } from 'dotenv'

import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Orther'

config()

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_TEMP_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(newPath) //mục đích giảm kích thước ảnh khi lưu db
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/uploads/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/uploads/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/uploads/video-stream/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/uploads/video-stream/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
}

const mediaService = new MediasService()
export default mediaService
