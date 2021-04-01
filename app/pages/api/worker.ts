import { NextApiRequest, NextApiResponse } from "next";

import { connectDb } from "../../server/db";
import environment from "../../server/environment";
import { checkPending } from "../../server/jobs/checkPending";
import { deleteRunners } from "../../server/jobs/deleteRunners";
import { deployRunners } from "../../server/jobs/deployRunners";
import { orchestrateRunners } from "../../server/jobs/orchestrateRunners";
import { orchestrateTriggers } from "../../server/jobs/orchestrateTriggers";
import { restartRunners } from "../../server/jobs/restartRunners";
import { Job, JOB_TYPES } from "../../server/jobs/types";
import { updateSegmentTeams } from "../../server/jobs/updateSegmentTeams";
import { Logger } from "../../server/Logger";
import { deleteOldEmails } from "../../server/models/email";
import { getAzureClient } from "../../server/services/azure/container";

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const logger = new Logger({ prefix: "worker" });

  if (req.headers.authorization !== environment.JOB_SECRET) {
    logger.debug("unauthorized");
    res.status(403).end();
    return;
  }

  const db = connectDb();

  const job: Job = req.body.job;

  if (!JOB_TYPES.includes(job)) throw new Error(`Invalid job ${job}`);

  logger.debug("start", job);

  const options = { db, logger };

  try {
    if (job === "checkPending") {
      await checkPending(options);
    } else if (job === "deleteOldEmails") {
      await deleteOldEmails(options);
    } else if (job === "orchestrateRunners") {
      await orchestrateRunners(options);
    } else if (job === "orchestrateTriggers") {
      await orchestrateTriggers(options);
    } else if (job === "updateSegmentTeams") {
      await updateSegmentTeams(options);
    } else {
      const client = await getAzureClient();
      if (job === "deleteRunners") {
        await deleteRunners(client, options);
      } else if (job === "deployRunners") {
        await deployRunners(client, options);
      } else if (job === "restartRunners") {
        await restartRunners(client, options);
      }
    }

    logger.debug("success", job);

    res.status(200).end();
  } catch (error) {
    logger.alert("worker failed", error);

    res.status(500).end();
  }

  await db.destroy();
}
