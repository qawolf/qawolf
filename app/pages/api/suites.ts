import { NextApiRequest, NextApiResponse } from "next";

import { handleSuitesRequest } from "../../server/api/suites";
import { connectDb } from "../../server/db";
import { Logger } from "../../server/Logger";

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const db = connectDb();
  const logger = new Logger({ prefix: "handleSuitesRequest" });

  await handleSuitesRequest(req, res, { db, logger });

  await db.destroy();
}
