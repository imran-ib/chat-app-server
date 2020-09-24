import { config } from 'dotenv'
config()
import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { applyMiddleware } from 'graphql-middleware'
import { createContext } from './context'
import { permissions } from './permissions'

const PORT = process.env.PORT || 4000

const server = new ApolloServer({
  schema: applyMiddleware(schema, permissions),
  // schema,
  context: createContext,
  playground: true,
  cors: true,
})

server.listen({ port: PORT }).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
})
