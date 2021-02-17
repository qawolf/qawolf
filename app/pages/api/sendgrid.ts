import { NextApiRequest, NextApiResponse } from "next";

import { handleSendGridRequest } from "../../server/api/sendgrid";
import { connectDb } from "../../server/db";
import { Logger } from "../../server/Logger";

// disable the default body parser
export const config = { api: { bodyParser: false } };

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const db = connectDb();
  const logger = new Logger();

  await handleSendGridRequest(req, res, { db, logger });

  await db.destroy();
}
