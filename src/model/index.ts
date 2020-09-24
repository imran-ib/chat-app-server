import { objectType } from "@nexus/schema";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const User = objectType({
  name: "User",
  definition(t) {
    t.int("id");
    t.string("name");
    t.string("email");
    t.list.field("posts", {
      type: "Post",
      resolve: (parent) =>
        prisma.user
          .findOne({
            where: { id: Number(parent.id) },
          })
          .posts(),
    });
  },
});

export const Post = objectType({
  name: "Post",
  definition(t) {
    t.int("id");
    t.string("title");
    t.string("content", {
      nullable: true,
    });
    t.boolean("published");
    t.field("author", {
      type: "User",
      nullable: true,
      resolve: (parent) =>
        prisma.post
          .findOne({
            where: { id: Number(parent.id) },
          })
          .author(),
    });
  },
});
