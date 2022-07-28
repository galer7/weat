// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { makeAuthOptions as makeNextAuthOptions } from "@/pages/api/oauth/[...nextauth]";
import { prisma } from "@/server/db/client";

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  const req = opts?.req;
  const res = opts?.res;

  const session =
    req &&
    res &&
    (await getServerSession(req, res, makeNextAuthOptions(req, res)));

  // These are added on every resolver's params
  return {
    req,
    res,
    session,
    prisma,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
