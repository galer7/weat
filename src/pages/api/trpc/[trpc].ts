import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/router/context";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error }) {
    console.error("Error:", error);
    if (error.code === "INTERNAL_SERVER_ERROR") {
      // send to bug reporting
    }
  },
});
