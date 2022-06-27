import * as trpc from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/backend/utils/prisma";

export const appRouter = trpc.router().mutation("register", {
  input: z.object({
    email: z.string(),
    password_hash: z.string(),
  }),
  async resolve({ input }) {
    await prisma.users.create({
      data: {
        email: input.email,
        password_hash: input.password_hash,
        first_name: "",
        last_name: "",
      },
    });
    return { success: true };
  },
});

// export type definition of API
export type AppRouter = typeof appRouter;
