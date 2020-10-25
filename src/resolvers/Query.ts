import * as nexus from '@nexus/schema'
import { AuthenticationError } from 'apollo-server'
import { prisma } from 'nexus-plugin-prisma'
import { getUserId, getTokenFromReq } from '../utils'

export const Query = nexus.queryType({
  definition(t) {
    t.crud.users({
      filtering: true,
      ordering: true,
      type: 'User',
      pagination: true,
    }) //TODO Delete this
    t.crud.messages() //TODO Delete this
    t.crud.friendsRequests()
    t.field('CurrentUser', {
      type: 'User',
      nullable: true,
      //@ts-ignore
      resolve: async (_root, _agrs, ctx) => {
        const userId = parseInt(getUserId(ctx))
        if (!userId) return

        return ctx.prisma.user.findOne({
          where: { id: userId },
          include: {
            friends: true,
          },
        })
      },
    })
    t.field('GetMessages', {
      type: 'Messages',
      list: true,
      args: { from: nexus.stringArg({ required: true }) },
      description: 'All Messages from User',
      //@ts-ignore
      resolve: async (_root, { from }, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx))
          if (!userId) return new AuthenticationError(`No User Found`)
          const user = await ctx.prisma.user.findOne({ where: { id: userId } })
          if (!user) return new AuthenticationError(`Not Authenticated`)
          const Sender = await ctx.prisma.user.findOne({
            where: { username: from },
          })



          if (!Sender) return new AuthenticationError(`User Not Found`)
          if (user.id === Sender.id)
            return new AuthenticationError(
              `Please Select Valid Percipient to retrieve messuages`
            )
          const AllMessages = await ctx.prisma.messages.findMany({
            where: {
              OR: [
                {
                  AND: [{ SenderId: Sender.id }, { ReceiverId: user.id }],
                },
                {
                  AND: [{ SenderId: user.id }, { ReceiverId: Sender.id }],
                },
              ],
            },
            orderBy: { createdAt: 'asc' },
          })

          return AllMessages
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('Friends', {
      type: 'User',

      nullable: true,
      //@ts-ignore
      resolve: async (_root, __args, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx))

          if (!userId) return new Error(`User not found`)
          return ctx.prisma.user.findOne({
            include: {
              MessagesRecieved: true,
              MessagesSent: true,
              friends: true,
            },
            where: { id: userId },
          })
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('GetUsers', {
      type: 'User',
      list: true,
      args: { emailOrUsername: nexus.stringArg({ required: true }) },
      //@ts-ignore
      resolve: async (_root, { emailOrUsername }, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx))
          const CurrentUser = await ctx.prisma.user.findOne({
            select: { friends: true },
            where: { id: userId },
          })
          

          const Friends = CurrentUser.friends.map((f) => f.username)

          return ctx.prisma.user.findMany({
            where: {
              AND: [
                {
                  OR: [
                    {
                      email: { contains: emailOrUsername },
                    },
                    {
                      username: { contains: emailOrUsername },
                    },
                  ],
                },
                {
                  NOT: [
                    {
                      id: userId,
                    },
                    {
                      username: {
                        in: Friends,
                      },
                    },
                  ],
                },
              ],
              //TODO filter out users friends
            },
          })
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
    t.field('GetFriendRequests', {
      type: 'FriendsRequest',
      list: true,
      nullable: true,
      // @ts-ignore
      resolve: (_root, __args, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx))

          return ctx.prisma.friendsRequest.findMany({
            where: {
              RequestReceiverId: userId,
            },
          })
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
  },
})
