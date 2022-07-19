import { createRouter } from "./context";
import { prisma } from "@/server/db/client";
import { z } from 'zod';

export const foodRouter = createRouter()
  .mutation("invite", {
    input: z.object({
      username: z.string()
    }),
    async resolve({ input: { username } }) {
      try {
        const foundUser = await prisma.user.findFirst({ where: { username } });
        if (!foundUser) {
          console.log(`there are no users with username ${username}`)
          return;
        }

      } catch (error) {
        console.log('error when registering user', error);
      }
    }
  })
