import { createRouter } from "./context";
import { prisma } from "@/server/db/client";
import { z } from "zod";

export const groupRouter = createRouter()
  .mutation("invite", {
    input: z.object({
      to: z.array(z.string()),
      from: z.string(),
    }),
    async resolve({ input: { to, from }, ctx: { session } }) {
      return Promise.all(
        to.map(async (toUser) => {
          try {
            if (toUser === from) return;
            // Find if the invited user exists
            const foundUser = await prisma.user.findFirst({
              where: { id: toUser },
            });
            if (!foundUser) {
              console.log(`there are no users with id ${to}`);
              return;
            }

            const currentUser = await prisma.user.findFirst({
              where: { id: session?.user?.id },
              include: { foodieGroup: { include: { users: true } } },
            });

            // If the foodie group doesn't exist, create it OR
            // If in a group alone, allow to create a new group and delete old one
            if (
              !currentUser?.foodieGroupId ||
              (currentUser.foodieGroup?.users &&
                currentUser.foodieGroup?.users.length === 1 &&
                currentUser.foodieGroup.users[0]?.id === currentUser.id)
            ) {
              if (currentUser?.foodieGroupId) {
                await prisma.foodieGroup.delete({
                  where: {
                    id: currentUser.foodieGroupId,
                  },
                });

                await prisma.user.updateMany({
                  where: { foodieGroupId: session?.user?.foodieGroupId },
                  data: { foodieGroupId: null },
                });
              }

              const newFoodieGroup = await prisma.foodieGroup.create({
                data: {},
              });

              await prisma.user.update({
                where: { id: from },
                data: {
                  foodieGroupId: newFoodieGroup.id,
                },
              });

              return newFoodieGroup.id;
            }
          } catch (error) {
            console.log("error when registering user", error);
          }
        })
      );
    },
  })
  .mutation("accept-invite", {
    input: z.object({
      from: z.string(),
    }),
    async resolve({ input: { from }, ctx: { session } }) {
      const sender = await prisma.user.findFirst({
        where: { id: from },
      });

      if (!sender) return;

      await prisma.user.update({
        where: { id: session?.user?.id },
        data: { foodieGroupId: sender.foodieGroupId },
      });
    },
  })
  .mutation("refuse-invite", {
    input: z.object({
      from: z.string(),
    }),
    async resolve({ input: { from } }) {
      // there is really nothing to do for the guy that declines the invite, but we can delete the group from here
      // if only this user was invited to the group and no one else?
      const sender = await prisma.user.findFirst({
        where: { id: from },
      });

      if (!sender || !sender.foodieGroupId) return;

      const count = await prisma.user.count({
        where: { foodieGroupId: sender.foodieGroupId },
      });

      if (count === 1) {
        await prisma.foodieGroup.delete({
          where: { id: sender.foodieGroupId },
        });

        await prisma.user.updateMany({
          where: { foodieGroupId: sender.foodieGroupId },
          data: { foodieGroupId: null },
        });
      }

      return sender.foodieGroupId;
    },
  })
  .mutation("leave", {
    input: z.object({}),
    async resolve({ ctx: { session } }) {
      await prisma.user.update({
        where: { id: session?.user?.id },
        data: { foodieGroupId: null },
      });

      const count = await prisma.user.count({
        where: { foodieGroupId: session?.user?.foodieGroupId },
      });

      if (count === 1) {
        // onDelete: setNull for user.foodieGroupId
        await prisma.foodieGroup.delete({
          where: { id: session?.user?.foodieGroupId },
        });

        await prisma.user.updateMany({
          where: { foodieGroupId: session?.user?.foodieGroupId },
          data: { foodieGroupId: null },
        });
      }
    },
  });
