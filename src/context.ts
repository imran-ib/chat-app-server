import { PrismaClient } from '@prisma/client'
import { PubSub } from 'apollo-server'
import { Context } from './types'

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
})
const pubsub = new PubSub()

export const createContext = (ctx: any): Context => {
  return {
    ...ctx,
    prisma,
    pubsub,
  }
}
