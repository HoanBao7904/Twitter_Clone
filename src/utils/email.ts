/* eslint-disable no-undef */
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
// const { config } = require('dotenv')
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
console.log(path)
config()
// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  body: string
  ccAddresses?: string | string[]
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendVerifyEmail = async ({ toAddress, subject, body }: { toAddress: string; subject: string; body: string }) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject
  })

  return await sesClient.send(sendEmailCommand)
}

export const veridyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')

export const sendRegisterVerifyEmail = (
  toAddress: string,
  email_verify_token: string,
  Template: string = veridyEmailTemplate
) => {
  return sendVerifyEmail({
    toAddress: toAddress,
    subject: 'verify your email',
    body: Template.replace('{{title}}', 'Please Verifyyour email')
      .replace('{{content}}', 'click the button below to verify your email')
      .replace('{{titleLink}}', 'click verify')
      .replace('{{link}}', `${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}`)
  })
}

export const sendForgotPasswordEmail = (
  toAddress: string,
  forgot_password_token: string,
  template: string = veridyEmailTemplate
) => {
  return sendVerifyEmail({
    toAddress,
    subject: 'Reset your password',
    body: template
      .replace('{{title}}', 'Reset Your Password')
      .replace('{{content}}', 'Click the button below to reset your password. This link will expire soon.')
      .replace('{{titleLink}}', 'Reset Password')
      .replace('{{link}}', `${process.env.CLIENT_URL}/forgot-password?token=${forgot_password_token}`)
    //cai route nay thong nhat giua client va SERVER
  })
}

// sendVerifyEmail(
//   'hoan.bao.nguyen.dev@gmail.com',
//   'Tiêu đề email',
//   '<h1>Nội dung email được gửi từ nguyenhoanbao4@gmail.com</h1>'
// )
