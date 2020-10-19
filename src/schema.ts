import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'
import * as nexus from '@nexus/schema'
import { join } from 'path'
import { Context } from './types'
import { User, AuthPayload, Message ,FriendsRequests,FriendsPayload} from './resolvers/Models'
import { Query } from './resolvers/Query'
import { Mutation } from './resolvers/Mutation'
// import { Subscription } from './resolvers/Subscription'

const nexusPrisma = nexusSchemaPrisma({
  prismaClient: (ctx: Context) => ctx.prisma,
  shouldGenerateArtifacts: true,
  experimentalCRUD: true,
  paginationStrategy: 'relay',

})

export const schema = nexus.makeSchema({
  types: [User, Query, Mutation, AuthPayload, Message, FriendsRequests,FriendsPayload],
  plugins: [nexusPrisma, nexus.connectionPlugin()],
  outputs: {
    typegen: join(__dirname, 'generated', 'index.d.ts'),
    schema: join(__dirname, 'generated', 'schema.graphql'),
  },
  shouldGenerateArtifacts: true,
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
