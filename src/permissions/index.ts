import { rule, shield, allow, or } from 'graphql-shield';
import { getUserId } from '../utils';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
//@ts-ignore
import format from 'date-format';
const rules = {
  isAuthenticatedUser: rule()(async (__parent, _args, context) => {
    const userId = parseInt(getUserId(context));
    const User = await prisma.user.findOne({ where: { id: userId } });
    if (User) {
      return true;
    } else {
      return false;
    }
  }),
};

export const permissions = shield({
  Query: {
    GetMessages: rules.isAuthenticatedUser,
    Friends: rules.isAuthenticatedUser,
    GetUsers: rules.isAuthenticatedUser,
    GetChats: rules.isAuthenticatedUser,
    GetFriendRequests: rules.isAuthenticatedUser,
  },
  Mutation: {
    SendMessage: rules.isAuthenticatedUser,
    ForwardMessage: rules.isAuthenticatedUser,
    DeleteMessage: rules.isAuthenticatedUser,
    AddFriend: rules.isAuthenticatedUser,
    ConfirmFriendRequest: rules.isAuthenticatedUser,
    DeleteChat: rules.isAuthenticatedUser,
    RestoreDeletedChat: rules.isAuthenticatedUser,
  },
});

// Set IsActive On Every Request to true
const UserActivity = {
  // We need To return User Null instead of throwing error
  returnUserNull: rule()(() => {
    return true;
  }),

  isActiveUser: rule()(async (__parent, _args, context) => {
    const userId = parseInt(getUserId(context));
    const User = await prisma.user.findOne({ where: { id: userId } });
    let isActive: boolean;
    let Time = format(new Date());
    if (userId) {
      await prisma.user.update({
        where: { id: User.id },
        data: { isActive: true, lastSeen: Time },
      });
      isActive = true;
    }
    return isActive;
  }),
};
export const UserActivityCheck = shield({
  Query: {
    CurrentUser: or(UserActivity.isActiveUser, UserActivity.returnUserNull),
  },
  Mutation: {},
});
