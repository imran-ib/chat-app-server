import * as nexus from '@nexus/schema'
import * as jwt from 'jsonwebtoken'
import { getUserId } from '../utils'
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from 'apollo-server'
import { validateEmail } from '../utils/ValidateEmail'
import { Hash, ComparePassword } from '../utils/HashPassword'
import { hotp, authenticator } from 'otplib'
import { Mails } from '../utils/Mails/SendMail'
import { uid } from 'rand-token'
import { prisma } from 'nexus-plugin-prisma'
import { resolve } from 'path'

export const Mutation = nexus.mutationType({
  definition(t) {
    t.crud.deleteManyUser()
    t.crud.deleteManyMessages()
    t.crud.deleteManyFriendsRequest()
    t.field('CreateUser', {
      type: 'AuthPayload',
      args: {
        email: nexus.stringArg(),
        username: nexus.stringArg(),
        password: nexus.stringArg(),
      },
      description: 'Create New User',
      //@ts-ignore
      resolve: async (_root, { email, username, password }, ctx) => {
        try {
          if (
            email.trim() === '' ||
            username.trim() === '' ||
            password.trim() == ''
          )
            return new UserInputError(`Missing Required Field`)
          const ValidEmail = validateEmail(email)
          if (!ValidEmail) return new UserInputError(`Email is Not Valid`)
          if (password.length < 4)
            return new UserInputError(`Password is too short`)

          const UserExistsWithEmail = await ctx.prisma.user.findOne({
            where: { email },
          })

          if (UserExistsWithEmail)
            return new UserInputError(`User with  "${email}" Already Exists`)
          const UserExistsWithUserName = await ctx.prisma.user.findOne({
            where: { username },
          })
          if (UserExistsWithUserName)
            return new UserInputError(`User with  "${username}" Already Exists`)

          const HashedPassword = await Hash(password)

          const user = await ctx.prisma.user.create({
            data: {
              email: email,
              username: username,
              password: HashedPassword,
            },
          })

          const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET, {
            expiresIn: '7d',
            mutatePayload: true,
            subject: 'Auth Token',
            header: { username: user.username, userEmail: user.email },
            issuer: `${user.username}`,
          })
          return {
            token,
            user,
          }
        } catch (error) {
          return new Error(error.message)
        }
      },
    })
    t.field('PasswordLogin', {
      type: 'AuthPayload',
      args: {
        emailOrUsername: nexus.stringArg({ required: true }),
        password: nexus.stringArg(),
      },
      //@ts-ignore
      resolve: async (_root, { emailOrUsername, password }, ctx) => {
        try {
          if (emailOrUsername.trim() === '' || password.trim() == '')
            return new UserInputError(`Missing Required Field`)
          const [user] = await ctx.prisma.user.findMany({
            where: {
              OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
          })
          if (!user) return new AuthenticationError(`User not Found`)
          // If no password then it means they are registered with social media
          if (!user.password)
            return new AuthenticationError(`Try Logging in with Social Media `)

          const isValidPassword = await ComparePassword(password, user.password)
          if (!isValidPassword) return new AuthenticationError('Wrong Password')

          const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET, {
            expiresIn: '7d',
            mutatePayload: true,
            subject: 'Auth Token',
            header: { username: user.username, userEmail: user.email },
            issuer: `${user.username}`,
          })
          ctx.res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1year cookie
          })
          return {
            token,
            user,
          }
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('OTPLogin', {
      type: 'String',
      nullable: true,
      args: { emailOrUsername: nexus.stringArg({ required: true }) },
      //@ts-ignore
      resolve: async (_root, { emailOrUsername }, ctx) => {
        try {
          if (emailOrUsername.trim() === '')
            return new UserInputError(`Missing Required Field`)

          const [user] = await ctx.prisma.user.findMany({
            where: {
              OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
          })
          if (!user) return new AuthenticationError(`User not Found`)
          const secret = authenticator.generateSecret()
          const counter: number = 6
          const OTP: number = parseInt(hotp.generate(secret, counter))
          const UpdatedUser = await ctx.prisma.user.update({
            where: { id: user.id },
            data: {
              OneTimePassword: OTP,
              loginSecret: secret,
            },
          })

          Mails.LoginSecreteMail(UpdatedUser, OTP)
          return `A One Time Password Has been Sent to ${UpdatedUser.email}`
        } catch (error) {
          console.log('error', error.message)
          return new AuthenticationError(error.message)
        }
      },
    }),
      t.field('ValidateOTP', {
        type: 'AuthPayload',
        args: {
          OTP: nexus.intArg({ required: true }),
          username: nexus.stringArg({ required: true }),
        },
        //@ts-ignore
        resolve: async (__root, { OTP, username }, ctx) => {
          try {
            const [user] = await ctx.prisma.user.findMany({
              where: {
                OR: [{ email: username }, { username: username }],
              },
            })
            if (!user) return new AuthenticationError(`User not Found`)

            const isValid = hotp.check(OTP.toString(), user.loginSecret, 6)
            if (!isValid) return new AuthenticationError(`Fail To Authenticate`)

            await ctx.prisma.user.update({
              where: { id: user.id },
              data: {
                OneTimePassword: null,
                loginSecret: null,
              },
            })

            const token = jwt.sign(
              { userId: user.id },
              process.env.APP_SECRET,
              {
                expiresIn: '7d',
                mutatePayload: true,
                subject: 'Auth Token',
                header: { username: user.username, userEmail: user.email },
                issuer: `${user.username}`,
              }
            )
            return {
              token,
              user,
            }
          } catch (error) {
            return new AuthenticationError(error.message)
          }
        },
      })
    t.field('RequestResetPassword', {
      type: 'String',
      args: { emailOrUsername: nexus.stringArg({ required: true }) },
      //@ts-ignore
      resolve: async (__root, { emailOrUsername }, ctx) => {
        try {
          const [user] = await ctx.prisma.user.findMany({
            where: {
              OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
          })

          if (!user) return new AuthenticationError(`User not Found`)

          const ResetToken = uid(40)
          const resetTokenExpiry = Date.now() + 1800000 // half an hour

          await ctx.prisma.user.update({
            where: { email: user.email },
            data: {
              PasswordResetToken: ResetToken,
              PasswordResetTokenExpiry: resetTokenExpiry,
            },
          })
          Mails.ForgotPasswordUser(user, ResetToken)
          return `Success! Password Reset Token Has Been Generated and Sent To Your Email Address`
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('ResetPassword', {
      type: 'AuthPayload',
      args: {
        token: nexus.stringArg({ required: true }),
        password: nexus.stringArg({ required: true }),
        ConfirmPassword: nexus.stringArg({ required: true }),
      },
      //@ts-ignore
      resolve: async (
        __root,
        { token: resetToken, password, ConfirmPassword },
        ctx
      ) => {
        try {
          if (password.length < 4) {
            return new Error(
              `Password is Too Short. It Should Not Be Less then 4 characters`
            )
          }
          if (password !== ConfirmPassword)
            return new Error('Your Password Don not Match')
          // 2. check if its a legit reset token
          const [user] = await ctx.prisma.user.findMany({
            where: {
              AND: [
                {
                  PasswordResetToken: {
                    equals: resetToken,
                  },
                },
                {
                  PasswordResetTokenExpiry: {
                    gte: Date.now() - 1800000,
                  },
                },
              ],
            },
          })

          if (!user) return new Error(`Your Token is Either invalid or expired`)
          const hashedPassword = await Hash(password)
          await ctx.prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              password: hashedPassword,
              PasswordResetToken: null,
              PasswordResetTokenExpiry: null,
            },
          })
          // Log User in

          const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET, {
            expiresIn: '7d',
            mutatePayload: true,
            subject: 'Auth Token',
            header: { username: user.username, userEmail: user.email },
            issuer: `${user.username}`,
          })

          return {
            token,
            user,
          }
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('SendMessage', {
      type: 'Messages',
      args: {
        Sender: nexus.stringArg({
          required: true,
          description: 'User who send Message',
        }),
        Receiver: nexus.stringArg({
          required: true,
          description: 'User who receive Message',
        }),
        content: nexus.stringArg({
          description: 'Content Of Message. text, emoji etc..',
        }),
        image: nexus.stringArg({
          description: 'If User send image as message',
        }),
      },
      description: 'Send Chat Message',
      //@ts-ignore
      resolve: async (_root, { Sender, Receiver, content, image }, ctx) => {
        try {
          const userId = getUserId(ctx)
          if (!userId) return new AuthenticationError(`Not Authenticated`)
          if (Sender.trim() === Receiver.trim()) {
            return new UserInputError(`You can not send Message to Yourself`)
          }
          const NewMessage = await ctx.prisma.messages.create({
            data: {
              from: {
                connect: {
                  username: Sender,
                },
              },
              to: {
                connect: {
                  username: Receiver,
                },
              },
              content,
              image,
            },
          })
          if (!NewMessage) return new UserInputError(`Can not Send Message `)
          ctx.pubsub.publish('NewMessage', NewMessage)
          return NewMessage
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('GoogleAuth', {
      type: 'AuthPayload',
      args: {
        email: nexus.stringArg(),
        images: nexus.stringArg(),
        googleId: nexus.stringArg(),
      },
      description: 'Log User in With Google',
      //@ts-ignore
      resolve: async (_root, { email, images, googleId }, ctx) => {
        try {
          let user
          const [UserExists] = await ctx.prisma.user.findMany({
            where: {
              OR: [
                {
                  email: email,
                },
                {
                  username: email,
                },
              ],
            },
          })
          if (UserExists) user = UserExists
          if (!UserExists) {
            user = await ctx.prisma.user.create({
              data: {
                email: email,
                username: email,
                avatar: images,
                googleId,
              },
            })
          }

          if (!user) return new Error(`Cannot Log you in`)
          const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET, {
            expiresIn: '7d',
            mutatePayload: true,
            subject: 'Auth Token',
            header: { username: user?.username, userEmail: user.email },
            issuer: `${user.username}`,
          })
          return {
            user,
            token,
          }
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('SetUserInactive', {
      type: 'String',
      args: { id: nexus.intArg({ required: true }) },
      //@ts-ignore
      resolve: async (_root, { id }, ctx) => {
        try {
          await ctx.prisma.user.update({
            where: { id },
            data: { isActive: false },
          })
          return `User is Set To InActive`
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('AddFriend', {
      type: 'String',
      args: { id: nexus.intArg({ required: true }) },
      //@ts-ignore
      resolve: async (_root, { id }, ctx) => {
        try {
          const userId: number = parseInt(getUserId(ctx))

          if (userId === id) return new Error(`You cannot add yourself friend`)
          const [user] = await ctx.prisma.user.findMany({
            where: {
              AND: [
                {
                  id: userId,
                },
                {
                  friends: {
                    some: {
                      id: id,
                    },
                  },
                },
              ],
            },
          })
          if (user) return new Error(`User is Already Friend`)

          const Requests = await ctx.prisma.friendsRequest.findMany({
            where: {
              RequestReceiverId: id,
            },
          })
          // If there are any old requests delete them
          if (Requests.length > 0)
            await ctx.prisma.friendsRequest.deleteMany({
              where: { RequestReceiverId: id },
            })
          // Add Friend
          await ctx.prisma.user.update({
            where: { id: userId },
            data: {
              friends: {
                connect: {
                  id,
                },
              },
            },
          })
          //Create new Firend req
          const NewFriendRequest = await ctx.prisma.friendsRequest.create({
            data: {
              reciever: {
                connect: {
                  id,
                },
              },
              sender: {
                connect: {
                  id: userId,
                },
              },
            },
          })
          ctx.pubsub.publish('FriendRequestSub', NewFriendRequest)
          return `Friend Added `
        } catch (error) {
          return new UserInputError(error.message)
        }
      },
    }),
      t.field('ConfirmFriendRequest', {
        type: 'String',
        args: { id: nexus.intArg({ required: true }) },
        //@ts-ignore
        resolve: async (_root, { id }, ctx) => {
          try {
            const Request = await ctx.prisma.friendsRequest.findOne({
              where: { id },
            })

            if (!Request) return new Error(`Request Not Found`)
            await ctx.prisma.user.update({
              where: {
                id: Request.RequestReceiverId,
              },
              data: {
                friends: {
                  connect: {
                    id: Request.RequsetSenderId,
                  },
                },
              },
            })
            await ctx.prisma.friendsRequest.delete({ where: { id } })

            return `Friend Added`
          } catch (error) {
            return new UserInputError(error.message)
          }
        },
      })
    t.field('RemoverFriend', {
      type: 'String',
      args: { FriendId: nexus.intArg({ required: true }) },
      //@ts-ignore
      resolve: async (_root, { FriendId }, ctx) => {
        try {
          const UserId = parseInt(getUserId(ctx))
          const User = await ctx.prisma.user.update({
            where: {
              id: UserId,
            },
            data: {
              friends: {
                disconnect: {
                  id: FriendId,
                },
              },
            },
          })
          if (!User) return new Error(`Friend Not Found`)
          return `Friend Removed`
        } catch (error) {
          return new UserInputError(error.message)
        }
      },
    }),
      t.field('CreateReaction', {
        type: 'Reaction',
        args: {
          messageId: nexus.intArg({ required: true }),
          content: nexus.stringArg({ required: true }),
        },
        description: 'React To Message',
        //@ts-ignore
        resolve: async (_root, { messageId, content }, ctx) => {
          try {
            const userId = getUserId(ctx)
            if (!userId) return new AuthenticationError('Unauthorized')
            const user = await ctx.prisma.user.findOne({
              where: { id: parseInt(userId) },
            })
            if (!user) return new AuthenticationError(`User not Found`)
            const CONTENTS = ['❤️', '😄', '😲', '😢', '😡', '👍', '👎']
            if (!CONTENTS.includes(content)) return new Error(`InValid Content`)
            const Message = await ctx.prisma.messages.findOne({
              where: { id: messageId },
            })

            if (!Message) return new UserInputError(`Message not found`)
            // user is allowed to react on message that they sent or received
            if (
              Message.SenderId !== user.id &&
              Message.ReceiverId !== user.id
            ) {
              return new ForbiddenError(`Not Allowed`)
            }

            let [Reaction] = await ctx.prisma.reaction.findMany({
              where: {
                AND: [
                  {
                    messageId: Message.id,
                  },
                  {
                    userId: user.id,
                  },
                ],
              },
            })

            if (Reaction) {
              await ctx.prisma.reaction.update({
                where: { id: Reaction.id },
                data: {
                  content,
                  message: {
                    connect: {
                      id: Message.id,
                    },
                  },
                  user: {
                    connect: {
                      id: user.id,
                    },
                  },
                },
              })
            } else {
              Reaction = await ctx.prisma.reaction.create({
                data: {
                  content,
                  message: {
                    connect: {
                      id: Message.id,
                    },
                  },
                  user: {
                    connect: {
                      id: user.id,
                    },
                  },
                },
              })
            }
            ctx.pubsub.publish('ReactionToMessage', Reaction)
            return Reaction
          } catch (error) {
            return new AuthenticationError(error.message)
          }
        },
      })
    t.field('SendFriendRequest', {
      type: 'User',
      args: { emailOrUsername: nexus.stringArg({ required: true }) },
      //@ts-ignore
      resolve: async (_root, { emailOrUsername }, ctx) => {
        try {
          //TODO Start from here
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
  },
})
