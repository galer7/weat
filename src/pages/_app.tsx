import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "@/server/router";
import { SessionProvider } from "next-auth/react";
import superjson from "superjson";
import { SocketProvider } from "@/state/SocketContext";
import { LoggedUserProvider } from "@/state/LoggedUserContext";
import { GroupStateProvider } from "@/state/GroupStateContext";
import { InvitationProvider } from "@/state/InvitationsContext";
import { NotificationProvider } from "@/state/NotificationsContext";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SocketProvider>
      <SessionProvider session={session}>
        <LoggedUserProvider>
          <GroupStateProvider>
            <InvitationProvider>
              <NotificationProvider>
                <Component {...pageProps} />
              </NotificationProvider>
            </InvitationProvider>
          </GroupStateProvider>
        </LoggedUserProvider>
      </SessionProvider>
    </SocketProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // Browser should use current path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
