import * as nexus from '@nexus/schema';
import { getUserId } from '../../utils';
import { UserInputError } from 'apollo-server';

export const FriendsMutations = (
  t: nexus.core.ObjectDefinitionBlock<'Mutation'>
) => {
  t.field('AddFriend', {
    type: 'String',
    //Other user id ⬇
    args: { id: nexus.intArg({ required: true }) },
    //@ts-ignore
    resolve: async (_root, { id }, ctx) => {
      try {
        const userId: number = parseInt(getUserId(ctx));

        if (userId === id) return new Error(`You cannot add yourself friend`);

        const [user] = await ctx.prisma.user.findMany({
          where: {
            AND: [
              {
                id: userId,
              },
              {
                friends: {
                  some: {
                    id: id,
                  },
                },
              },
            ],
          },
        });
        if (user) return new Error(`User is Already Friend`);

        //TODO Test this again with multiple requests to multiple users
        const Requests = await ctx.prisma.friendsRequest.findMany({
          where: {
            AND: [
              {
                RequestReceiverId: id,
              },
              {
                RequsetSenderId: userId,
              },
            ],
          },
        });

        // If there are any old requests delete them
        if (Requests.length > 0)
          await ctx.prisma.friendsRequest.deleteMany({
            where: { RequestReceiverId: id },
          });
        const friend = await ctx.prisma.friends.create({
          data: {
            friend: { connect: { id } },
            user: { connect: { id: userId } },
          },
        });

        //Create new Firend req
        const NewFriendRequest = await ctx.prisma.friendsRequest.create({
          data: {
            reciever: {
              connect: {
                id,
              },
            },
            sender: {
              connect: {
                id: userId,
              },
            },
          },
        });
        ctx.pubsub.publish('FriendRequestSub', NewFriendRequest);

        return `Friend Added `;
      } catch (error) {
        return new UserInputError(error.message);
      }
    },
  }),
    t.field('RemoverFriend', {
      type: 'String',
      args: { FriendId: nexus.intArg({ required: true }) },
      //@ts-ignore
      resolve: async function (_root, { FriendId }, ctx) {
        try {
          const UserId = parseInt(getUserId(ctx));

          const Requests = await ctx.prisma.friendsRequest.findMany({
            where: {
              AND: [
                {
                  RequestReceiverId: FriendId,
                },
                {
                  RequsetSenderId: UserId,
                },
              ],
            },
          });

          // If there are any old requests delete them
          if (Requests.length > 0)
            await ctx.prisma.friendsRequest.deleteMany({
              where: { RequestReceiverId: FriendId },
            });
          await ctx.prisma.friends.deleteMany({
            where: {
              AND: [
                {
                  userId: UserId,
                },
                {
                  friendId: FriendId,
                },
              ],
            },
          });

          // if (!User) return new Error(`Friend Not Found`);
          return `Friend Removed`;
        } catch (error) {
          console.log('error.message', error.message);
          return new UserInputError(error.message);
        }
      },
    }),
    t.field('ConfirmFriendRequest', {
      type: 'String',
      args: {
        id: nexus.intArg({ required: true }),
      },
      //@ts-ignore
      resolve: async (_root, { id, FriendId }, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));
          const user = await ctx.prisma.user.findOne({
            where: { id: userId },
            select: { friends: true },
          });

          const Request = await ctx.prisma.friendsRequest.findOne({
            where: { id },
          });
          if (!Request) return new Error(`Request Not Found`);

          const Sender = await ctx.prisma.user.findOne({
            where: { id: Request.RequsetSenderId },
          });

          await ctx.prisma.friends.create({
            data: {
              friend: { connect: { id: Sender.id } },
              user: { connect: { id: userId } },
            },
          });
          await ctx.prisma.friendsRequest.delete({ where: { id } });

          return `Friend Added`;
        } catch (error) {
          return new UserInputError(error.message);
        }
      },
    });
};
