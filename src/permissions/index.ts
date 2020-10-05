import { rule, shield } from 'graphql-shield'
import { getUserId, getTokenFromReq } from '../utils'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const rules = {
  isAuthenticatedUser: rule()(async (__parent, _args, context) => {
    const userId = parseInt(getUserId(context))
    const User = await prisma.user.findOne({ where: { id: userId } })
    if (User) {
      return true
    } else {
      return false
    }
  }),
}

export const permissions = shield({
  Query: {
    GetMessages: rules.isAuthenticatedUser,
  },
  Mutation: {
    SentMessage: rules.isAuthenticatedUser,
  },
})
