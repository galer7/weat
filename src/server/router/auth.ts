import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { hash } from 'bcrypt';
import { prisma } from "@/server/db/client";
import { z } from 'zod';
import crypto from 'crypto';

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
        return prisma.user.create({
          data: {
            email,
            password: passwordHash,
            username: crypto.randomBytes(8).toString("hex")
          }
        })
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
