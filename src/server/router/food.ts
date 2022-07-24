import { createRouter } from "./context";
import { prisma } from "@/server/db/client";
import { z } from "zod";

export const foodRouter = createRouter()
  .mutation("invite", {
    input: z.object({
      invitedName: z.string(),
      currentName: z.string(),
    }),
    async resolve({ input: { invitedName, currentName }, ctx: { session } }) {
      try {
        if (invitedName === currentName) return;
        // Find if the invited user exists
        const foundUser = await prisma.user.findFirst({
          where: { name: invitedName },
        });
        if (!foundUser) {
          console.log(`there are no users with name ${invitedName}`);
          return;
        }

        // TODO: uncomment in future
        // if (foundUser.foodieGroupId) {
        //   console.log(`user ${invitedName} is in another foodie group`);
        //   return;
        // }

        // Check for re-invite logic
        const currentUser = await prisma.user.findFirst({
          where: { id: session?.user?.id },
        });

        // If the foodie group doesn't exist, create it
        if (!currentUser?.foodieGroupId) {
          await prisma.foodieGroup.create({ data: {} });
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
    },
  });
