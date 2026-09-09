import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
export const initFolder = () => {
  // console.log(path.resolve('uploads'))//D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\uploads
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // muc dich la de tao folder lồng nhau
      })
    }
  })
}

// export const handleUploadImage = async (req: Request) => {
//   // console.log(__dirname) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\src\controllers
//   // console.log(path.resolve()) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend
//   // console.log(path.resolve('uploads')) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\uploads

//   const form = formidable({
//     uploadDir: UPLOAD_IMAGE_TEMP_DIR, //lưu file vào thư mịc đc setup
//     maxFiles: 4, //số file được upload 1
//     keepExtensions: true, //mặc định là false(không có thông tin đuôi chỉ có tên file,nên không xác định được file đó file ảnh)
//     maxFileSize: 10 * 1024 * 1024, // maxsize là 10mb
//     maxTotalFileSize: 50 * 1024 * 1024,
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     filter: ({ name, originalFilename, mimetype }) => {
//       console.log('DEBUG filter:', { name, originalFilename, mimetype })
//       const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
//       if (!valid) {
//         form.emit('error', new Error('File type is not valid'))
//       }
//       return valid
//     }
//   })

//   return new Promise<File[]>((resolve, reject) => {
//     form.parse(req, (err, fields, files) => {
//       console.log('files', files)
//       console.log(files.image as File[])
//       // console.log('fields', fields)
//       if (err) {
//         return reject(err)
//       }
//       // eslint-disable-next-line no-extra-boolean-cast
//       if (!Boolean(files.image)) {
//         return reject(new Error('file is empty'))
//       }
//       resolve(files.image as File[])
//     })
//   })
// }

export const handleUploadImage = async (req: Request) => {
  let isErrorEmitted = false
  const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    maxTotalFileSize: 50 * 1024 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      const ext = path.extname(originalFilename || '').toLowerCase()
      const validByMime = Boolean(mimetype?.includes('image/'))
      const validByExt = validImageExtensions.includes(ext)
      const valid = name === 'image' && (validByMime || validByExt)

      console.log('DEBUG filter:', { name, originalFilename, mimetype, ext, valid })

      if (!valid && !isErrorEmitted) {
        isErrorEmitted = true
        form.emit('error', new Error('File type is not valid'))
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('file is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

// export const handleUploadVideo = async (req: Request) => {
//   // console.log(__dirname) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\src\controllers
//   // console.log(path.resolve()) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend
//   // console.log(path.resolve('uploads')) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\uploads
//   const form = formidable({
//     uploadDir: UPLOAD_VIDEO_DIR, //lưu file vào thư mịc đc setup
//     maxFiles: 1, //số file được upload 1
//     // keepExtensions: true, //mặc định là false(không có thông tin đuôi chỉ có tên file,nên không xác định được file đó file ảnh)
//     maxFileSize: 500 * 1024 * 1024, //50MB nhan them 1024 len 300 mb
//     // maxTotalFileSize: 50 * 1024 * 1024 * 4,
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     filter: ({ name, originalFilename, mimetype }) => {
//       const valid = name === 'video' && Boolean(mimetype?.includes('video/') || mimetype?.includes('quicktime'))
//       if (!valid) {
//         form.emit('error', new Error('File type is not valid'))
//       }
//       return valid
//     }
//   })

//   return new Promise<File[]>((resolve, reject) => {
//     form.parse(req, (err, fields, files) => {
//       // console.log('files', files)
//       // console.log(files.image as File[])
//       // console.log('fields', fields)
//       if (err) {
//         reject(err)
//       }
//       // eslint-disable-next-line no-extra-boolean-cast
//       if (!Boolean(files.video)) {
//         return reject(new Error('file is empty'))
//       }
//       const videos = files.video as File[]
//       // videos.forEach((video) => {
//       //   const ext = getExtension(video.originalFilename as string)
//       //   fs.renameSync(video.filepath, video.filepath + '.' + ext)
//       //   video.newFilename = video.newFilename + '.' + ext
//       // })

//       videos.forEach((video) => {
//         const ext = getExtension(video.originalFilename as string)

//         const newFilePath = video.filepath + '.' + ext

//         fs.renameSync(video.filepath, newFilePath)

//         video.filepath = newFilePath
//         video.newFilename = video.newFilename + '.' + ext
//       })

//       resolve(files.video as File[])
//     })
//   })
// }

export const handleUploadVideo = async (req: Request) => {
  let isErrorEmitted = false
  const validVideoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']

  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 500 * 1024 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      const ext = path.extname(originalFilename || '').toLowerCase()
      const validByMime = Boolean(mimetype?.includes('video/') || mimetype?.includes('quicktime'))
      const validByExt = validVideoExtensions.includes(ext)
      const valid = name === 'video' && (validByMime || validByExt)

      if (!valid && !isErrorEmitted) {
        isErrorEmitted = true
        form.emit('error', new Error('File type is not valid'))
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err) // thêm return
      }
      if (!files.video) {
        return reject(new Error('file is empty'))
      }
      const videos = files.video as File[]

      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        const newFilePath = video.filepath + '.' + ext
        fs.renameSync(video.filepath, newFilePath)
        video.filepath = newFilePath
        video.newFilename = video.newFilename + '.' + ext
      })

      resolve(files.video as File[])
    })
  })
}
export const getNameFromFullName = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}

export const getExtension = (fullname: string) => {
  const nameArr = fullname.split('.')
  return nameArr[nameArr.length - 1]
}
