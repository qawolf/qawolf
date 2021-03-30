import { NextApiRequest, NextApiResponse } from "next";

import { handleNetlifySuitesRequest } from "../../../server/api/netlify/suites";
import { connectDb } from "../../../server/db";
import { Logger } from "../../../server/Logger";

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const db = connectDb();
  const logger = new Logger();

  await handleNetlifySuitesRequest(req, res, { db, logger });

  await db.destroy();
}
