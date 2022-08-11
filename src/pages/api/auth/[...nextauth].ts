import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/server/db/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { User } from "@prisma/client";

export const makeAuthOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions => ({
  callbacks: {
    session({ session, user }) {
      console.log("session", { session, user });
      (session.user as User).foodieGroupId = user.foodieGroupId as
        | string
        | null;
      (session.user as User).id = user.id;
      return session;
    },
    redirect(params) {
      return `${params.baseUrl}/food`;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
});

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Do whatever you want here, before the request is passed down to `NextAuth`
  return await NextAuth(req, res, makeAuthOptions(req, res));
}
