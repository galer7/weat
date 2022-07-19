import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { hash } from 'bcrypt';
import { prisma } from "@/server/db/client";
import { z } from 'zod';

export const authRouter = createRouter()
  .mutation("register", {
    input: z.object({
      email: z.string().email(),
      password: z.string()
    }),
    async resolve({ input: { email, password } }) {
      try {
        console.log('received form inputs from client:', { email, password })
        const foundUser = await prisma.user.findFirst({ where: { email } });
        console.log({ foundUser })
        if (foundUser) {
          console.log('there exists a user with this email already')
          return;
        }

        const passwordHash = await hash(password, 10)
        return prisma.user.create({ data: { email, password: passwordHash } })
      } catch (error) {
        console.log('error when registering user', error);
      }
    }
  })
  .query("getSession", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("getSecretMessage", {
    async resolve({ ctx }) {
      return "You are logged in and can see this secret message!";
    },
  });
