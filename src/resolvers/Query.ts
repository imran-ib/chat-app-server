import * as nexus from '@nexus/schema';
import { AuthenticationError } from 'apollo-server';
import { getUserId } from '../utils';

export const Query = nexus.queryType({
  definition(t) {
    t.crud.users(); //TODO Delete this
    t.crud.messages(); //TODO Delete this
    t.crud.friendsRequests();
    t.field('CurrentUser', {
      type: 'User',
      nullable: true,
      //@ts-ignore
      resolve: async (_root, _agrs, ctx) => {
        const userId = parseInt(getUserId(ctx));
        if (!userId) return;

        return ctx.prisma.user.findOne({
          where: { id: userId },
          include: {
            friends: true,
          },
        });
      },
    });
    t.field('OtherUser', {
      type: 'User',
      args: { userId: nexus.intArg({ required: true }) },
      description: 'Refetch Other User To Update Users Online Status',
      //@ts-ignore
      resolve: async (_root, { userId }, ctx) => {
        try {
          return ctx.prisma.user.findOne({
            where: { id: userId },
          });
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });
    t.field('GetMessages', {
      type: 'Messages',
      list: true,
      args: { from: nexus.stringArg({ required: true }) },
      description: 'All Messages from User',
      //@ts-ignore
      resolve: async (_root, { from }, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));
          if (!userId) return new AuthenticationError(`No User Found`);
          const user = await ctx.prisma.user.findOne({ where: { id: userId } });
          if (!user) return new AuthenticationError(`Not Authenticated`);
          const Sender = await ctx.prisma.user.findOne({
            where: { username: from },
          });
          if (!Sender) return new AuthenticationError(`User Not Found`);
          if (user.id === Sender.id)
            return new AuthenticationError(
              `Please Select Valid Percipient to retrieve messuages`
            );

          const [
            BlockedStatus,
          ] = await ctx.prisma.temporaryBlockOtherUserOnDeleteChat.findMany({
            where: {
              AND: [{ blockerId: user.id }, { blockeeId: Sender.id }],
            },
          });

          let AllMessages: [];
          if (!BlockedStatus) {
            //@ts-ignore
            AllMessages = await ctx.prisma.messages.findMany({
              where: {
                OR: [
                  {
                    AND: [{ SenderId: Sender.id }, { ReceiverId: user.id }],
                  },
                  {
                    AND: [{ SenderId: user.id }, { ReceiverId: Sender.id }],
                  },
                ],
              },
              orderBy: { createdAt: 'asc' },
            });
          } else {
            AllMessages = [];
          }
          // console.log('definition -> AllMessages', AllMessages)

          return AllMessages;
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });
    t.field('Friends', {
      type: 'Friends',
      nullable: true,
      list: true,
      //@ts-ignore
      resolve: async (_root, __args, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));

          if (!userId) return new Error(`User not found`);

          const Friend = await ctx.prisma.friends.findMany({
            include: { friend: true },
            where: {
              userId,
            },
          });

          return Friend;
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });

    t.field('GetChats', {
      type: 'Friends',
      nullable: true,
      list: true,

      //@ts-ignore
      resolve: async (_root, __args, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));
          if (!userId) return new Error(`User not found`);
          const Friends = await ctx.prisma.friends.findMany({
            where: { userId: userId },
            include: {
              friend: {
                include: { MessagesRecieved: true, MessagesSent: true },
              },
            },
          });

          const users = Friends.filter((fr) => {
            return (
              fr.friend.MessagesSent.length > 0 ||
              fr.friend.MessagesRecieved.length > 0
            );
          });

          return users;
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });
    t.field('GetUsers', {
      type: 'User',
      list: true,
      args: { emailOrUsername: nexus.stringArg({ required: true }) },
      //@ts-ignore
      resolve: async (_root, { emailOrUsername }, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));

          const Friends = await ctx.prisma.friends.findMany({
            where: {
              userId,
            },
            include: { friend: true, user: true },
          });
          const usersnames = Friends.map((fr) => fr.friend.username);

          return ctx.prisma.user.findMany({
            where: {
              AND: [
                {
                  OR: [
                    {
                      email: { contains: emailOrUsername },
                    },
                    {
                      username: { contains: emailOrUsername },
                    },
                  ],
                },
                {
                  NOT: [
                    {
                      id: userId,
                    },
                    {
                      username: {
                        in: usersnames,
                      },
                    },
                  ],
                },
              ],
            },
          });
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });
    t.field('GetFriendRequests', {
      type: 'FriendsRequest',
      list: true,
      nullable: true,
      // @ts-ignore
      resolve: (_root, __args, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));

          return ctx.prisma.friendsRequest.findMany({
            where: {
              RequestReceiverId: userId,
            },
          });
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });
    t.field('GetUsersBlockedStatus', {
      type: 'temporaryBlockOtherUserOnDeleteChat',
      args: { username: nexus.stringArg({ required: true }) },

      nullable: true,
      //@ts-ignore
      resolve: async (_root, { username }, ctx) => {
        const userId = parseInt(getUserId(ctx));
        const user = await ctx.prisma.user.findOne({ where: { id: userId } });
        const otherUser = await ctx.prisma.user.findOne({
          where: { username },
        });

        const [
          isBlocked,
        ] = await ctx.prisma.temporaryBlockOtherUserOnDeleteChat.findMany({
          where: {
            AND: [
              {
                blockerId: user.id,
              },
              {
                blockeeId: otherUser.id,
              },
            ],
          },
        });

        return isBlocked;
      },
    });
    t.field('GetUsersMedia', {
      type: 'UsersMedia',
      list: true,
      nullable: true,
      //@ts-ignore
      resolve: async (_root, __args, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));
          return ctx.prisma.usersMedia.findMany({
            select: { id: true, image: true },
            where: {
              OR: [
                {
                  //Sender
                  userId,
                },
                {
                  //Receiver
                  OtherUserId: userId,
                },
              ],
            },
          });
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });

    t.field('GetMediaBetweenUsers', {
      type: 'UsersMedia',
      args: {
        OtherUserId: nexus.intArg({ required: true }),
      },
      description: 'Get Media Between Two Users',
      list: true,
      nullable: true,
      //@ts-ignore
      resolve: async (_root, { OtherUserId }, ctx) => {
        try {
          const userId = parseInt(getUserId(ctx));
          if (userId === OtherUserId)
            return new Error(`Media Can Be Fetched Between Two Users Only`);
          return ctx.prisma.usersMedia.findMany({
            select: { id: true, image: true },
            where: {
              OR: [
                {
                  AND: [{ userId }, { OtherUserId }],
                },
                {
                  AND: [
                    {
                      userId: OtherUserId,
                    },
                    {
                      OtherUserId: userId,
                    },
                  ],
                },
              ],
            },
          });
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });
    t.field('SearchTermResults', {
      type: 'Messages',
      list: true,
      nullable: true,
      args: {
        term: nexus.stringArg({ required: true }),
      },
      //@ts-ignore
      async resolve(root, { term }, ctx) {
        return ctx.prisma.messages.findMany({
          where: {
            content: {
              contains: term,
            },
          },
          orderBy: { createdAt: 'asc' },
        });
      },
    });
  },
});

// export const SearchTermResults = nexus.queryField((t) => {
//   t.connectionField('SearchTermResults', {
//     type: 'Messages',
//     disableBackwardPagination: true,

//     additionalArgs: {
//       term: nexus.stringArg({ required: true }),
//     },
//     inheritAdditionalArgs: true,
//     //@ts-ignore
//     async resolve(root, args, ctx, info) {
//       await ctx.prisma.messages.findMany({
//         where: {
//           OR: [
//             {
//               content: {
//                 contains: args.term,
//               },
//             },
//             {
//               from: {
//                 username: { contains: args.term },
//               },
//             },
//             {
//               to: {
//                 username: { contains: args.term },
//               },
//             },
//           ],
//         },
//         orderBy: { createdAt: 'asc' },
//       });
//     },
//   });
// });
/**+
here: {
            OR: [
              {
                content: {
                  contains: term,
                },
              },
              {
                from: {
                  OR: [
                    {
                      username: { contains: term },
                    },
                    {
                      email: { contains: term },
                    },
                  ],
                },
              },
              {
                to: {
                  OR: [
                    {
                          username: { contains: term },
                    },
                    {
                      email: { contains: term },
                    },
                  ],
                },
              },
            ],
          }, */
