import { NextApiRequest, NextApiResponse } from "next";

import { handleStripeRequest } from "../../server/api/stripe";
import { connectDb } from "../../server/db";
import { Logger } from "../../server/Logger";

// Stripe requires the raw body to construct the event
export const config = {
  api: { bodyParser: false },
};

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const db = connectDb();
  const logger = new Logger();

  await handleStripeRequest(req, res, { db, logger });

  await db.destroy();
}
