import * as nexus from '@nexus/schema'

export const Query = nexus.queryType({
    definition(t) {
      t.crud.users()
      t.crud.posts()
    },
  })
  