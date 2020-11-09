import * as nexus from '@nexus/schema';
import * as jwt from 'jsonwebtoken';
import { getUserId } from '../utils';
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from 'apollo-server';
import { validateEmail } from '../utils/ValidateEmail';
import { Hash, ComparePassword } from '../utils/HashPassword';
import { hotp, authenticator } from 'otplib';
import { Mails } from '../utils/Mails/SendMail';
import { uid } from 'rand-token';
import { UserMutations } from './Mutations/UserMutation';
import { FriendsMutations } from './Mutations/FriendsMutations';
import { MessagesMutations } from './Mutations/MessagesMutation';

export const Mutation = nexus.mutationType({
  definition(t) {
    UserMutations(t);
    FriendsMutations(t);
    MessagesMutations(t);
    t.crud.deleteManytemporaryBlockOtherUserOnDeleteChat();
    t.crud.deleteManyUser();
    t.crud.deleteManyFriendsRequest();
    t.crud.deleteManyMessages();
  },
});
