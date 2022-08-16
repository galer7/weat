import { createRouter } from "./context";
import { prisma } from "@/server/db/client";
import { z } from "zod";

export const usersRouter = createRouter().query("getForSearch", {
  input: z.object({
    search: z.string(),
  }),
  async resolve({ input: { search } }) {
    let rawResults;
    if (!search) {
      rawResults = prisma.user.findMany({
        where: {},
        include: { sessions: {} },
      });
    } else {
      rawResults = prisma.user.findMany({
        where: {
          name: {
            search: `${search}*`,
          },
        },
        include: { sessions: {} },
      });
    }

    return (await rawResults).map(({ sessions, ...restOfUser }) => ({
      ...restOfUser,
      online: sessions.some(({ expires }) => expires >= new Date()),
    }));
  },
});
