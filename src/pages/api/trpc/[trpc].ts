import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/router/context";

const SECONDS_IN_YEAR = 31536000;

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
  responseMeta({ ctx, paths, type, errors }) {
    const condition = !!(
      paths &&
      paths.every((path) => path.includes("food.")) &&
      type === "query" &&
      errors.length === 0 &&
      ctx?.res
    );

    console.log({ paths, condition, type, errors });

    if (condition)
      return {
        headers: {
          "Cache-Control": `max-age=${SECONDS_IN_YEAR}`,
        },
      };

    return {};
  },
});
