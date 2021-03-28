import { NextApiRequest, NextApiResponse } from "next";

import { handleSuiteRequest } from "../../../server/api/suites/suite";
import { connectDb } from "../../../server/db";
import { Logger } from "../../../server/Logger";

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const db = connectDb();
  const logger = new Logger();

  await handleSuiteRequest(req, res, { db, logger });

  await db.destroy();
}
