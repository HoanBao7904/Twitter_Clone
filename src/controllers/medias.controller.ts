import { NextFunction, Request, Response } from 'express'
import mediaService from '~/services/medias.services'
// import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.handleUploadSingleImage(req)
  // console.log(data)
  return res.json({
    message: 'upload success',
    result: url
  })
}
