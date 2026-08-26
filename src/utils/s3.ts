import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { config } from 'dotenv'
import fs from 'fs'
// import path from 'path'
config()
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
// s3.listBuckets({}).then((data) => console.log(data)) //nó sẽ gọi leenn amazon web service
//kết nối thành công mới làm bươc phía dưới
//D:\KHOAHOC\NodeJS_Super(Du Thanh Duoc)\twitter\Backend\uploads\images\temp\efy5e7jmiypt5wcf477ap89g3.jpg
// const file = fs.readFileSync(path.resolve('uploads/images/temp/efy5e7jmiypt5wcf477ap89g3.jpg'))
export const uploadFileToS3 = ({
  fileName,
  filePath,
  ContentType
}: {
  fileName: string
  filePath: string
  ContentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: 'twitter-clone-2026-ap-southeast-1',
      Key: fileName,
      Body: fs.readFileSync(filePath),
      ContentType: ContentType
    },

    // optional tags
    tags: [
      /*...*/
    ],

    // additional optional fields show default values below:

    // (optional) concurrency configuration
    queueSize: 4,

    // (optional) size of each part, in bytes, at least 5MB
    partSize: 1024 * 1024 * 5,

    // (optional) when true, do not automatically call AbortMultipartUpload when
    // a multipart upload fails to complete. You should then manually handle
    // the leftover parts.
    leavePartsOnError: false
  })
  return parallelUploads3.done()
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((res) => console.log(res))
