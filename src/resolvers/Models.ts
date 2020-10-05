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
    t.model.createdAt()
    t.model.updatedAt()
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
