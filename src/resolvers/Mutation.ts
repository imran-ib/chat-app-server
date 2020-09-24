import * as nexus from "@nexus/schema";
import * as jwt from "jsonwebtoken";
import { getUserId } from "../utils";

export const Mutation = nexus.mutationType({
  definition(t) {
    t.field("createUSer", {
      type: "AuthPayload",
      nullable: true,
      args: {
        email: nexus.stringArg(),
        name: nexus.stringArg(),
      },
      //@ts-ignore
      resolve: async (_root, { email, name }, ctx) => {
        const user = await ctx.prisma.user.create({
          data: {
            email: email,
            name: name,
          },
        });
        const token = jwt.sign({ userId: user.id }, "APP_SECRET");
        return {
          token,
          user,
        };
      },
    });
    t.crud.createOneUser(),
      t.field("login", {
        type: "AuthPayload",
        args: {
          email: nexus.stringArg(),
        },
        //@ts-ignore
        resolve: async (_root, { email }, ctx) => {
          const user = await ctx.prisma.user.findOne({ where: { email } });
          if (!user) throw new Error(`User Not Found`);
          const token = jwt.sign({ userId: user.id }, "APP_SECRET");
          return {
            token,
            user,
          };
        },
      });
    t.field("createDraft", {
      type: "Post",
      args: {
        title: nexus.stringArg(),
        content: nexus.stringArg({ nullable: true }),
      },
      resolve: async (_parent, { title, content }, ctx) => {
        // const userId = getUserId(ctx);
        // if (!userId) throw new Error(`User not found`);
        const newPost = await ctx.prisma.post.create({
          data: {
            title,
            content,
            published: false,
          },
        });

        // publish the subscription here
        ctx.pubsub.publish("latestPost", newPost);
        return newPost;
      },
    });
  },
});
