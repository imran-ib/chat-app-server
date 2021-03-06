import * as nexus from '@nexus/schema';
import { withFilter } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const Subscription = nexus.subscriptionField('NewMessage', {
  type: 'Messages',
  subscribe: withFilter(
    (_root, _args, ctx) => {
      return ctx.pubsub.asyncIterator('NewMessage');
    },
    //@ts-ignore
    async (parent, _, ctx) => {
      const user = ctx.connection.context;
      // Update Users Last typed with each message
      await prisma.user.update({
        where: { id: parent.SenderId },
        data: { lastTyped: new Date().toISOString() },
      });

      if (user.id === parent.SenderId || user.id === parent.ReceiverId) {
        return true;
      } else {
        return false;
      }
    }
  ),
  resolve(payload) {
    return payload;
  },
});

export const ReactionSubscription = nexus.subscriptionField(
  'ReactionToMessage',
  {
    type: 'Reaction',
    subscribe: withFilter(
      (_root, _args, ctx) => {
        return ctx.pubsub.asyncIterator('ReactionToMessage');
      },
      //@ts-ignore
      async (parent, _, ctx) => {
        const user = ctx.connection.context;
        
        const Message = await prisma.messages.findOne({
          where: { id: parent.messageId },
        });

        if (user.id === Message.SenderId || user.id === Message.ReceiverId) {
          return true;
        } else {
          return false;
        }
      }
    ),
    resolve(payload) {
      return payload;
    },
  }
);
export const FriendRequestSubscription = nexus.subscriptionField(
  'FriendRequestSub',
  {
    type: 'FriendsRequest',
    subscribe: withFilter(
      (_root, _args, ctx) => {
        return ctx.pubsub.asyncIterator('FriendRequestSub');
      },
      //@ts-ignore
      async (parent, _, ctx) => {
        const user = ctx.connection.context;
        const [Req] = await ctx.prisma.friendsRequest.findMany({
          where: {
            RequestReceiverId: user.id,
          },
        });
        if (Req.RequestReceiverId === parent.RequestReceiverId) {
          return true;
        } else {
          return false;
        }
      }
    ),
    resolve(payload) {
      return payload;
    },
  }
);
export const DeleteMessageSubscription = nexus.subscriptionField(
  'DeleteMessageSub',
  {
    type: 'Messages',
    subscribe: withFilter(
      (_root, _args, ctx) => {
        return ctx.pubsub.asyncIterator('DeleteMessageSub');
      },
      //@ts-ignore
      async (parent, _, ctx) => {
        const user = ctx.connection.context;
        if (user.id === parent.SenderId || user.id === parent.ReceiverId) {
          return true;
        } else {
          return false;
        }
      }
    ),
    resolve(payload) {
      return payload;
    },
  }
);

//ReactionToMessage

// REVIEW another way to write subscriptions

// export const Subscription = nexus.subscriptionType({
//   definition(t){
//     t.field("NewMessage", {
//       type:"Messages",
//       subscribe(_root, _args, ctx){
//         return ctx.pubsub.asyncIterator('NewMessage')
//       },
//       resolve(eventData: boolean) {
//         return eventData
//       },
//     })
//   }

// })
