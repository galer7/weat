import { createRouter } from "./context";
import { prisma } from "@/server/db/client";
import { z } from "zod";

export const foodRouter = createRouter()
  .mutation("invite", {
    input: z.object({
      to: z.string(),
      from: z.string(),
    }),
    async resolve({ input: { to, from }, ctx: { session } }) {
      try {
        if (to === from) return;
        // Find if the invited user exists
        const foundUser = await prisma.user.findFirst({
          where: { name: to },
        });
        if (!foundUser) {
          console.log(`there are no users with name ${to}`);
          return;
        }

        // TODO: uncomment in future
        // if (foundUser.foodieGroupId) {
        //   console.log(`user ${to} is in another foodie group`);
        //   return;
        // }

        // Check for re-invite logic
        const currentUser = await prisma.user.findFirst({
          where: { id: session?.user?.id },
          include: { foodieGroup: { include: { users: true } } },
        });

        // If the foodie group doesn't exist, create it
        // If in a group alone, allow to create a new group
        if (
          !currentUser?.foodieGroupId ||
          (currentUser.foodieGroup?.users.length === 1 &&
            currentUser.foodieGroup.users[0]?.id === currentUser.id)
        ) {
          const newFoodieGroup = await prisma.foodieGroup.create({ data: {} });
          await prisma.user.update({
            where: { name: from },
            data: { foodieGroupId: newFoodieGroup.id },
          });
          return newFoodieGroup.id;
        }
      } catch (error) {
        console.log("error when registering user", error);
      }
    },
  })
  .mutation("accept-invite", {
    input: z.object({
      from: z.string(),
    }),
    async resolve({ input: { from }, ctx: { session } }) {
      const sender = await prisma.user.findFirst({
        where: { name: from },
      });

      if (!sender) return;

      await prisma.user.update({
        where: { id: session?.user?.id },
        data: { foodieGroupId: sender.foodieGroupId },
      });

      return sender.foodieGroupId;
    },
  });
