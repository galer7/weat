// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const allUsers = await prisma.users.findMany({});
  // use `console.dir` to print nested objects
  console.dir(allUsers, { depth: null });
  res.status(200).json({ name: "hi" });
}
