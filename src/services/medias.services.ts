import { Request } from 'express'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { config } from 'dotenv'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Orther'
import { uploadFileToS3 } from '~/utils/s3'
import mine from 'mime'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
config()

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(newPath) //mục đích giảm kích thước ảnh khi lưu db

        const s3Result = await uploadFileToS3({
          fileName: 'images/' + newName, //tạo thêm folder lưu tấm ảnh trong đó
          filePath: newPath,
          ContentType: mine.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/uploads/image/${newName}.jpg`
        //     : `http://localhost:${process.env.PORT}/static/uploads/image/${newName}.jpg`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    console.log(files)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          fileName: 'videos/' + file.newFilename,
          filePath: file.filepath,
          ContentType: mine.getType(file.filepath) as string
        })
        fsPromise.unlink(file.filepath)

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/uploads/video-stream/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/uploads/video-stream/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )
    return result
  }
}

const mediaService = new MediasService()
export default mediaService
