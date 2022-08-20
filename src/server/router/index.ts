// src/server/router/index.ts
import { createRouter } from "./context";
import { groupRouter } from "./group";
import { foodRouter } from "./food";
import { usersRouter } from "./users";
import { TRPCError } from "@trpc/server";
import superjson from "superjson";

export const appRouter = createRouter()
  .transformer(superjson)
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .merge("group.", groupRouter)
  .merge("food.", foodRouter)
  .merge("users.", usersRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
