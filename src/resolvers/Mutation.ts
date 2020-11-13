import * as nexus from '@nexus/schema';
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
