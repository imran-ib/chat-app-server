import { nexusPrismaPlugin } from 'nexus-prisma'
import * as nexus from '@nexus/schema'
import { join } from 'path'
import { Context } from './types'
import { Post, User } from './model'
import { Query } from './resolvers/Query'
import { Mutation } from './resolvers/Mutation'
import { Subscription } from './resolvers/Subscription'
import { AuthPayload } from './resolvers/Models'

const nexusPrisma = nexusPrismaPlugin({
  prismaClient: (ctx: Context) => ctx.prisma,
})

export const schema = nexus.makeSchema({
  types: [User, Post, Query, Mutation, Subscription, AuthPayload],
  plugins: [nexusPrisma],
  outputs: {
    typegen: join(__dirname, 'generated', 'index.d.ts'),
    schema: join(__dirname, 'generated', 'schema.graphql'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
      {
        source: join(__dirname, 'types.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
})
