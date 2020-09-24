
import * as nexus from '@nexus/schema'

export const Subscription = nexus.subscriptionField('latestPost', {
    type: 'Post',
    subscribe(_root, _args, ctx) {
      return ctx.pubsub.asyncIterator('latestPost')
    },
    resolve(payload) {
      return payload
    },
  })