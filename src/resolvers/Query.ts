import * as nexus from '@nexus/schema'
import { AuthenticationError } from 'apollo-server'
import { getUserId, getTokenFromReq } from '../utils'

export const Query = nexus.queryType({
  definition(t) {
    t.crud.users() //TODO Delete this
    t.crud.messages() //TODO Delete this
    t.field('CurrentUser', {
      type: 'User',
      nullable: true,

      //@ts-ignore
      resolve: async (_root, _agrs, ctx) => {
        const userId = parseInt(getUserId(ctx))
        if (!userId) return
        return ctx.prisma.user.findOne({ where: { id: userId } })
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
          const AllMessages = await ctx.prisma.messages.findMany({
            where: {
              AND: [
                {
                  ReceiverId: { equals: user.id },
                },
                {
                  SenderId: { equals: Sender.id },
                },
              ],
            },
            orderBy: { createdAt: 'desc' },
          })
          return AllMessages
        } catch (error) {
          return new AuthenticationError(error.message)
        }
      },
    })
  },
})
