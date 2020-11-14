import * as nexus from '@nexus/schema';
import * as jwt from 'jsonwebtoken';
import { getUserId } from '../../utils';
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from 'apollo-server';
import { validateEmail } from '../../utils/ValidateEmail';
import { Hash, ComparePassword } from '../../utils/HashPassword';
import { hotp, authenticator } from 'otplib';
import { Mails } from '../../utils/Mails/SendMail';
import { uid } from 'rand-token';

export const MessagesMutations = (
  t: nexus.core.ObjectDefinitionBlock<'Mutation'>
) => {
  t.field('SendMessage', {
    type: 'Messages',
    args: {
      Sender: nexus.stringArg({
        required: true,
        description: 'User who send Message',
      }),
      Receiver: nexus.stringArg({
        required: true,
        description: 'User who receive Message',
      }),
      content: nexus.stringArg({
        description: 'Content Of Message. text, emoji etc..',
      }),
      image: nexus.stringArg({
        description: 'If User send image as message',
      }),
    },
    description: 'Send Chat Message',
    //@ts-ignore
    resolve: async (_root, { Sender, Receiver, content, image }, ctx) => {
      try {
        const userId = getUserId(ctx);
        if (!userId) return new AuthenticationError(`Not Authenticated`);
        if (Sender.trim() === Receiver.trim()) {
          return new UserInputError(`You can not send Message to Yourself`);
        }
        const user = await ctx.prisma.user.findOne({
          where: { username: Sender },
        });
        const OtherUser = await ctx.prisma.user.findOne({
          where: { username: Receiver },
        });
        const [
          BlockedStatus,
        ] = await ctx.prisma.temporaryBlockOtherUserOnDeleteChat.findMany({
          where: {
            AND: [
              {
                blockerId: user.id,
              },
              {
                blockeeId: OtherUser.id,
              },
            ],
          },
        });

        //TODO Figure out if sender is friend and update message
        const NewMessage = await ctx.prisma.messages.create({
          data: {
            from: {
              connect: {
                username: Sender,
              },
            },
            to: {
              connect: {
                username: Receiver,
              },
            },
            content,
            image,
          },
        });
        if (!NewMessage) return new UserInputError(`Can not Send Message `);
        ctx.pubsub.publish('NewMessage', NewMessage);
        //Create Media if User is sending Image
        if (image.trim() !== '') {
          await ctx.prisma.usersMedia.create({
            data: {
              Message: { connect: { id: NewMessage.id } },
              user: { connect: { id: user.id } },
              otherUser: { connect: { id: OtherUser.id } },
              image,
            },
          });
        }
        return NewMessage;
      } catch (error) {
        return new AuthenticationError(error.message);
      }
    },
  }),
    t.field('ForwardMessage', {
      type: 'Messages',
      args: {
        Sender: nexus.stringArg({
          required: true,
          description: 'User who send Message',
        }),
        Receiver: nexus.stringArg({
          required: true,
          description: 'User who receive Message',
        }),
        content: nexus.stringArg({
          description: 'Content Of Message. text, emoji etc..',
        }),
        image: nexus.stringArg({
          description: 'If User send image as message',
        }),
      },
      description: 'Send Chat Message',
      //@ts-ignore
      resolve: async (_root, { Sender, Receiver, content, image }, ctx) => {
        try {
          const userId = getUserId(ctx);
          if (!userId) return new AuthenticationError(`Not Authenticated`);
          if (Sender.trim() === Receiver.trim()) {
            return new UserInputError(`You can not send Message to Yourself`);
          }
          const NewMessage = await ctx.prisma.messages.create({
            data: {
              from: {
                connect: {
                  username: Sender,
                },
              },
              to: {
                connect: {
                  username: Receiver,
                },
              },
              content,
              image,
              forwarded: true,
            },
          });
          if (!NewMessage) return new UserInputError(`Can not Send Message `);
          // ctx.pubsub.publish('NewMessage', NewMessage);
          return NewMessage;
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    }),
    t.field('DeleteMessage', {
      type: 'String',
      args: { MessageId: nexus.intArg({ required: true }) },
      description: 'Delete Message',
      //@ts-ignore
      resolve: async (_root, { MessageId }, ctx) => {
        try {
          const UserId = parseInt(getUserId(ctx));
          if (!UserId) return new Error(`User Not Found`);
          const [Message] = await ctx.prisma.messages.findMany({
            where: {
              AND: [
                {
                  id: MessageId,
                },
                {
                  SenderId: UserId,
                },
              ],
            },
          });

          if (!Message) return new Error(`Unable to Delete The Message`);
          await ctx.prisma.reaction.deleteMany({
            where: {
              messageId: MessageId,
            },
          });
          await ctx.prisma.usersMedia.deleteMany({
            where: {
              MessageId: Message.id,
            },
          });

          await ctx.prisma.messages.delete({
            where: {
              id: MessageId,
            },
          });

          ctx.pubsub.publish('DeleteMessageSub', Message);

          return `Success! Messages Deleted`;
        } catch (error) {
          return new AuthenticationError(error.message);
        }
      },
    });
  t.field('DeleteChat', {
    type: 'String',
    args: {
      blockerId: nexus.intArg({ required: true }),
      blockeeId: nexus.intArg({ required: true }),
    },
    description: 'Delete Chat',
    //@ts-ignore
    resolve: async (_root, { blockerId, blockeeId }, ctx) => {
      try {
        const userId = parseInt(getUserId(ctx));

        const AllMessages = await ctx.prisma.messages.findMany({
          where: {
            OR: [
              {
                AND: [{ SenderId: blockerId }, { ReceiverId: blockeeId }],
              },
              {
                AND: [{ SenderId: blockeeId }, { ReceiverId: blockerId }],
              },
            ],
          },
        });

        const ids = AllMessages.map((m) => m.id);

        await ctx.prisma.user.update({
          where: { id: userId },
          data: {
            BlockedMessagesIds: {
              set: ids,
            },
          },
        });

        const Blocked = await ctx.prisma.temporaryBlockOtherUserOnDeleteChat.create(
          {
            data: {
              blocker: {
                connect: {
                  id: blockerId,
                },
              },
              blockee: {
                connect: {
                  id: blockeeId,
                },
              },
            },
          }
        );

        return `User Chat is Temporary Blocked`;
      } catch (error) {
        return new AuthenticationError(error.message);
      }
    },
  });

  t.field('RestoreDeletedChat', {
    type: 'Messages',
    list: true,
    args: {
      blocker: nexus.intArg({ required: true }),
      blockee: nexus.intArg({ required: true }),
    },
    description: 'Restore Deleted Chat',
    //@ts-ignore
    resolve: async (_root, { blocker, blockee }, ctx) => {
      try {
        const userId = parseInt(getUserId(ctx));

        const [
          BlockedStatus,
        ] = await ctx.prisma.temporaryBlockOtherUserOnDeleteChat.findMany({
          where: {
            AND: [{ blockerId: blocker }, { blockeeId: blockee }],
          },
        });

        if (!BlockedStatus) return new Error(`No Data Found`);

        await ctx.prisma.temporaryBlockOtherUserOnDeleteChat.deleteMany({
          where: {
            AND: [
              {
                blockerId: userId,
              },
              {
                blockeeId: blockee,
              },
            ],
          },
        });
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { BlockedMessagesIds: undefined },
        });

        const AllMessages = await ctx.prisma.messages.findMany({
          where: {
            OR: [
              {
                AND: [{ SenderId: blocker }, { ReceiverId: blockee }],
              },
              {
                AND: [{ SenderId: blockee }, { ReceiverId: blocker }],
              },
            ],
          },
          orderBy: { createdAt: 'asc' },
        });

        return AllMessages;
      } catch (error) {
        return new AuthenticationError(error.message);
      }
    },
  });

  t.field('SetUserInactive', {
    type: 'String',
    args: { id: nexus.intArg({ required: true }) },
    //@ts-ignore
    resolve: async (_root, { id }, ctx) => {
      try {
        await ctx.prisma.user.update({
          where: { id },
          data: { isActive: false },
        });
        return `User is Set To InActive`;
      } catch (error) {
        return new AuthenticationError(error.message);
      }
    },
  });

  t.field('CreateReaction', {
    type: 'Reaction',
    args: {
      messageId: nexus.intArg({ required: true }),
      content: nexus.stringArg({ required: true }),
    },
    description: 'React To Message',
    //@ts-ignore
    resolve: async (_root, { messageId, content }, ctx) => {
      try {
        const userId = getUserId(ctx);
        if (!userId) return new AuthenticationError('Unauthorized');
        const user = await ctx.prisma.user.findOne({
          where: { id: parseInt(userId) },
        });
        if (!user) return new AuthenticationError(`User not Found`);
        const CONTENTS = ['❤️', '😄', '😲', '😢', '😡', '👍', '👎'];
        if (!CONTENTS.includes(content)) return new Error(`InValid Content`);
        const Message = await ctx.prisma.messages.findOne({
          where: { id: messageId },
        });

        if (!Message) return new UserInputError(`Message not found`);
        // user is allowed to react on message that they sent or received
        if (Message.SenderId !== user.id && Message.ReceiverId !== user.id) {
          return new ForbiddenError(`Not Allowed`);
        }

        let [Reaction] = await ctx.prisma.reaction.findMany({
          where: {
            AND: [
              {
                messageId: Message.id,
              },
              {
                userId: user.id,
              },
            ],
          },
        });

        if (Reaction) {
          await ctx.prisma.reaction.update({
            where: { id: Reaction.id },
            data: {
              content,
              message: {
                connect: {
                  id: Message.id,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        } else {
          Reaction = await ctx.prisma.reaction.create({
            data: {
              content,
              message: {
                connect: {
                  id: Message.id,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        }
        ctx.pubsub.publish('ReactionToMessage', Reaction);
        return Reaction;
      } catch (error) {
        return new AuthenticationError(error.message);
      }
    },
  });
};
