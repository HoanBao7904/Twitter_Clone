import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  // console.log(path.resolve('uploads'))//D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\uploads

  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // muc dich la de tao folder lồng nhau
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  // console.log(__dirname) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\src\controllers
  // console.log(path.resolve()) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend
  // console.log(path.resolve('uploads')) //D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\uploads
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR, //lưu file vào thư mịc đc setup
    maxFiles: 1, //số file được upload 1
    keepExtensions: true, //mặc định là false(không có thông tin đuôi chỉ có tên file,nên không xác định được file đó file ảnh)
    maxFileSize: 3 * 1024 * 1024, //300KB nhan them 1024 len 300 mb
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error', new Error('File type is not valid'))
      }
      return valid
    }
  })

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log('files', files)
      console.log('fields', fields)
      if (err) {
        reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('file is empty'))
      }
      resolve((files.image as File[])[0])
    })
  })
}

export const getNameFromFullName = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}
