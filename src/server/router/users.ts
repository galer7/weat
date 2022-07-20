import { createRouter } from "./context";
import { prisma } from "@/server/db/client";

export const usersRouter = createRouter()
  .query("getAll", {
    async resolve() {
      return prisma.user.findMany({ where: {}, select: { name: true } });
    }
  });
