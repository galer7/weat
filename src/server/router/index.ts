// src/server/router/index.ts
import { createRouter } from "./context";
import { authRouter } from "./auth";

export const appRouter = createRouter()
  .merge("auth.", authRouter)

// export type definition of API
export type AppRouter = typeof appRouter;
