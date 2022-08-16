import { createRouter } from "./context";
import { prisma } from "@/server/db/client";
import { z } from "zod";

export const usersRouter = createRouter().query("getForSearch", {
  input: z.object({
    search: z.string(),
  }),
  async resolve({ input: { search }, ctx }) {
    let rawResults;
    if (!search) {
      rawResults = await prisma.user.findMany({
        where: { name: { not: ctx.session?.user?.name as string } },
      });
    } else {
      rawResults = await prisma.user.findMany({
        where: {
          name: {
            search: `${search}*`,
            not: ctx.session?.user?.name as string,
          },
        },
      });
    }

    return rawResults;
  },
});
