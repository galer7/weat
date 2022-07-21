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

        if (foundUser.foodieGroupId) {
          console.log(`user ${invitedName} is in another foodie group`)
          return;
        }

        // Check for re-invite logic
        const currentUser = await prisma.user.findFirst({ where: { id: session?.user?.id } })
        let desiredFoodieGroupId;

        // If the foodie group doesn't exist, create it
        if (!currentUser?.foodieGroupId) {
          const newFoodieGroup = await prisma.foodieGroup.create({ data: {} });
          desiredFoodieGroupId = newFoodieGroup.id;
        } else {
          desiredFoodieGroupId = currentUser.foodieGroupId
        }

        await prisma.user.update({
          where: { name: invitedName },
          data: { foodieGroupId: desiredFoodieGroupId }
        })

        // TODO: send invite to `name` on websocket
      } catch (error) {
        console.log('error when registering user', error);
      }
    }
  })
