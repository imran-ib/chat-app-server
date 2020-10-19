import { config } from 'dotenv'
config()
import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { applyMiddleware } from 'graphql-middleware'
// import graphqlPinoMiddleware from 'graphql-pino-middleware'
import { createContext } from './context'
import { permissions, UserActivityCheck } from './permissions'

const PORT = process.env.PORT || 4000
// const pinoMiddleware = graphqlPinoMiddleware()

const server = new ApolloServer({
  schema: applyMiddleware(schema, permissions, UserActivityCheck),
  // schema,
  context: createContext,
  playground: true,
  cors: true,
  tracing: true,
})

server.listen({ port: PORT }).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
})
