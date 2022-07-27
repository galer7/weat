import NextAuth, { type NextAuthOptions } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

// Prisma adapter for NextAuth, optional and can be removed
import { prisma } from "@/server/db/client";

export const makeAuthOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions => ({
  // Include user.id on session
  callbacks: {
    session({ session, token }) {
      console.log("session", { session, token });
      if (session?.user) {
        session.user.id = token.uid as string;

        if (token.foodieGroupId) {
          session.user.foodieGroupId = token.foodieGroupId as string;
        }
      }
      return session;
    },
    redirect(params) {
      return `${params.baseUrl}/food`;
    },
    async jwt({ token, user }) {
      console.log("jwt", { user, token });
      if (user) {
        // just after login, fresh data. persist data from login in jwt
        token.uid = user.id;
      }

      console.log("req.url:::", req.url);
      if (req.url === "/api/auth/session?update") {
        const user = await prisma.user.findFirst({
          where: { id: token.uid as string },
        });
        token.foodieGroupId = user?.foodieGroupId;
      }
      return token;
    },
  },
  providers: [
    // ...add more providers here
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials, _req) {
        const user = await prisma.user.findFirst({
          where: {
            email: credentials?.email,
          },
        });

        if (!user || !credentials?.password) return null;
        const isSamePassword = await compare(
          credentials.password,
          user.password
        );
        if (!isSamePassword) return null;

        return user;
      },
    }),
  ],
  debug: true,
});

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  console.log("inside next auth page", { url: req.url });
  // Do whatever you want here, before the request is passed down to `NextAuth`
  return await NextAuth(req, res, makeAuthOptions(req, res));
}
