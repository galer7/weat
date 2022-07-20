import { createRouter } from "./context";
import { prisma } from "@/server/db/client";
import { z } from 'zod';

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
        const foundUser = await prisma.user.findFirst({ where: { name: invitedName } });
        if (!foundUser) {
          console.log(`there are no users with name ${invitedName}`)
          return;
        }

        // Check for re-invite logic
        const currentUser = await prisma.user.findFirst({ where: { id: session?.user?.id } })

        // If the foodie group doesn't exist, create it
        if (!currentUser?.foodieGroupId) {
          const newFoodieGroup = await prisma.foodieGroup.create({ data: {} });
          await prisma.user.update({
            where: { id: session?.user?.id },
            data: { foodieGroupId: newFoodieGroup.id }
          })
        }

        // TODO: send invite to `name` on websocket
      } catch (error) {
        console.log('error when registering user', error);
      }
    }
  })
