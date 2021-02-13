import { NextApiRequest, NextApiResponse } from "next";

import { handleGitHubRequest } from "../../server/api/github";
import { connectDb } from "../../server/db";
import { Logger } from "../../server/Logger";

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const db = connectDb();
  const logger = new Logger();

  await handleGitHubRequest(req, res, { db, logger });

  await db.destroy();
}
