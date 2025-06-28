import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { buildNextAuthOptions } from "../auth/[...nextauth].api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res)
  );

  if (!session) {
    return res.status(401).end();
  }

  const userId = session.user.id;

  const intervals = await prisma.userTimeInterval.findMany({
    where: { user_id: userId },
    select: {
      week_day: true,
      time_start_in_minutes: true,
      time_end_in_minutes: true,
    },
    orderBy: { week_day: "asc" },
  });

  return res.status(200).json({ intervals });
}
