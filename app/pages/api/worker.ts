import { NextApiRequest, NextApiResponse } from "next";

import { connectDb } from "../../server/db";
import environment from "../../server/environment";
import { orchestrateTriggers } from "../../server/jobs/orchestrateTriggers";
import { runPendingJob } from "../../server/jobs/runPendingJob";
import { syncTeams } from "../../server/jobs/syncTeams";
import { Job, JOB_TYPES } from "../../server/jobs/types";
import { Logger } from "../../server/Logger";
import { deleteOldEmails } from "../../server/models/email";

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
    if (job === "runPendingJob") {
      const pending_job_count = await runPendingJob(options);
      logger.debug("pending job count", pending_job_count);

      res.status(200).send({ pending_job_count });
      return;
    }

    if (job === "deleteOldEmails") {
      await deleteOldEmails(options);
    } else if (job === "orchestrateTriggers") {
      await orchestrateTriggers(options);
    } else if (job === "syncTeams") {
      await syncTeams(options);
    }

    logger.debug("success", job);

    res.status(200).end();
  } catch (error) {
    logger.alert("worker failed", error);

    res.status(500).end();
  }

  await db.destroy();
}
