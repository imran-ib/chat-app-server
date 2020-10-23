import * as nexus from '@nexus/schema'

export const User = nexus.objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.avatar()
    t.model.username()
    t.model.friends()
    t.model.MessagesRecieved()
    t.model.MessagesSent()
    t.model.followedBy()
    t.model.following()
    t.model.isActive()
    t.model.lastSeen()
    t.model.FriendRequestRecieved()
    t.model.FriendRequsetSent()
    t.model.reactions()
    t.model.createdAt()
    t.model.updatedAt()
  },
})

export const Reaction = nexus.objectType({
  name: 'Reaction',
  definition(t) {
    t.model.id()
    t.model.createdAt()
    t.model.content()
    t.model.message()
    t.model.messageId()
    t.model.user()
    t.model.userId()
    t.model.createdAt()
    t.model.updatedAt()
  },
})

export const FriendsRequests = nexus.objectType({
  name: 'FriendsRequest',
  definition(t) {
    t.model.id()
    t.model.RequestReceiverId()
    t.model.RequsetSenderId()
    t.model.sender()
    t.model.reciever()
    t.model.createdAt()
    t.model.updatedAt
  },
})

export const Message = nexus.objectType({
  name: 'Messages',
  definition(t) {
    t.model.id()
    t.model.content()
    t.model.image()
    t.model.from()
    t.model.SenderId()
    t.model.to()
    t.model.ReceiverId()
    t.model.isSenderFriend()
    t.model.isSenderFollowing()
    t.model.isSenderFollowedBy()
    t.model.reactions()
    t.model.createdAt()
    t.model.updatedAt()
  },
})

export const AuthPayload = nexus.objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token')
    t.field('user', { type: 'User' })
  },
})

export const FriendsPayload = nexus.objectType({
  name: 'FriendsPayload',
  definition(t) {
    t.field('user', { type: 'User', nullable: true })
    t.field('message', { type: 'Messages', nullable: true, list: true })
  },
})
