import nodemailer from 'nodemailer'
import { LoginSecret, ForgotPasswordUser } from './Mailtemplates'
//@ts-ignore
import sgTransport from 'nodemailer-sendgrid-transport'

const options = {
  service: 'SendGrid',
  auth: {
    api_user: process.env.SENDGRID_USERNAME,
    api_key: process.env.SENDGRID_PASSWORD,
  },
}
export const Mails = {
  async LoginSecreteMail(user: any, Key: number) {
    const mailer = nodemailer.createTransport(sgTransport(options))
    const mailOptions: any = {
      to: user.email,
      from: 'iCHAT@imran-irshad.io',
      subject: 'Your One Time Password',
      html: LoginSecret(user, Key),
    }
    return mailer.sendMail(mailOptions, function (err: any, info: any) {
      if (err) {
        console.log(err)
      } else {
        console.log('Message sent: ' + info.response)
      }
    })
  },
  async ForgotPasswordUser(user: any, token: string) {
    const mailer = nodemailer.createTransport(sgTransport(options))
    const mailOptions: any = {
      to: user.email,
      from: 'iCHAT@imran-irshad.io',
      subject: 'Password Reset Token',
      html: ForgotPasswordUser(user, token),
    }
    return mailer.sendMail(mailOptions, function (err: any, info: any) {
      if (err) {
        console.log(err)
      } else {
        console.log('Message sent: ' + info.response)
      }
    })
  },
}

// issues Faced
// Forgot to install sendgrid and types
//add this in tsconfig ==>  "esModuleInterop": true,
