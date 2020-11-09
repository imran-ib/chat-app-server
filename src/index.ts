import { config } from 'dotenv';
config();
import { ApolloServer } from 'apollo-server';
import { schema } from './schema';
import { applyMiddleware } from 'graphql-middleware';
// import graphqlPinoMiddleware from 'graphql-pino-middleware'
import { createContext } from './context';
import { permissions, UserActivityCheck } from './permissions';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
// const pinoMiddleware = graphqlPinoMiddleware()
interface Token {
  userId: string;
}

const server = new ApolloServer({
  schema: applyMiddleware(schema, permissions, UserActivityCheck),
  // schema,
  context: createContext,
  subscriptions: {
    onConnect: async (connectionParams: any) => {
      if (connectionParams.Authorization) {
        const token = connectionParams.Authorization.replace('Bearer ', '');
        if (!token) throw new Error(`Not Authorized`);
        const verifiedToken = verify(token, process.env.APP_SECRET) as Token;
        let userId;
        if (verifiedToken) {
          userId = verifiedToken.userId;
        }
        return await prisma.user.findOne({
          where: { id: parseInt(userId) },
        });
      }
      throw new Error('Missing auth token!');
    },
    onDisconnect: () => {
      console.log('websocket disconnect');
    },
  },
  playground: true,
  cors: true,
  tracing: true,
});

server.listen({ port: PORT }).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
