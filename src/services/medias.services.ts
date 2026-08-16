import { Request } from 'express'
// import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
// import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
// import { isProduction } from '~/constants/config'
import { config } from 'dotenv'

import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import { UPLOAD_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
config()

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = await getNameFromFullName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath) //mục đích giảm kích thước ảnh khi lưu db
    fs.unlinkSync(file.filepath)
    return isProduction
      ? `${process.env.HOST}/uploads/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/uploads/${newName}.jpg`
  }
}

const mediaService = new MediasService()
export default mediaService
