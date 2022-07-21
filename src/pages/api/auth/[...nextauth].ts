import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from 'bcrypt';

// Prisma adapter for NextAuth, optional and can be removed
import { prisma } from "@/server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.uid as string
      }
      return session;
    },
    redirect(params) {
      return `${params.baseUrl}/food`
    },
    jwt({ token, user }) {
      if (user) {
        // just after login, fresh data. persist data from login in jwt
        token.uid = user.id;
      }
      return token;
    }
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
          }
        });

        if (!user || !credentials?.password) return null;
        const isSamePassword = await compare(credentials.password, user.password);
        if (!isSamePassword) return null;

        return user;
      },
    }),
  ]
};

export default NextAuth(authOptions);
