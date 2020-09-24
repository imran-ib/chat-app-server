import { rule, shield } from "graphql-shield";
import { getUserId } from "../utils";

const rules = {
  isAuthenticatedUser: rule()((parent, args, context) => {
    const userId = getUserId(context);
    return Boolean(userId);
  }),

  // isPostOwner: rule()(async (parent, { id }, context) => {
  //   const userId = getUserId(context);
  //   const author = await context.prisma.post
  //     .findOne({
  //       where: {
  //         id: Number(id),
  //       },
  //     })
  //     .author();
  //   return userId === author.id;
  // }),
};

export const permissions = shield({
  Query: {},
  Mutation: {
    createDraft: rules.isAuthenticatedUser,
  },
});
