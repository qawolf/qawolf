import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import environment from "../../server/environment";
import { checkPending } from "../../server/jobs/checkPending";
import { deleteRunners } from "../../server/jobs/deleteRunners";
import { deployRunners } from "../../server/jobs/deployRunners";
import { orchestrateRunners } from "../../server/jobs/orchestrateRunners";
import { orchestrateTriggers } from "../../server/jobs/orchestrateTriggers";
import { restartRunners } from "../../server/jobs/restartRunners";
import { Job, JOB_TYPES } from "../../server/jobs/types";
import { Logger } from "../../server/Logger";
import { getAzureClient } from "../../server/services/azure/container";

const handleWorkerRequest: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const logger = new Logger({ prefix: "worker" });

  if (req.headers.authorization !== environment.JOB_SECRET) {
    logger.debug("unauthorized");
    res.status(403).end();
  }

  const job: Job = req.body.job;

  if (!JOB_TYPES.includes(job)) throw new Error(`Invalid job ${job}`);

  logger.debug("start", job);

  try {
    if (job === "checkPending") {
      await checkPending(logger);
    } else if (job === "orchestrateRunners") {
      await orchestrateRunners(logger);
    } else if (job === "orchestrateTriggers") {
      await orchestrateTriggers(logger);
    } else {
      const client = await getAzureClient();
      const options = { client, logger };
      if (job === "deleteRunners") {
        await deleteRunners(options);
      } else if (job === "deployRunners") {
        await deployRunners(options);
      } else if (job === "restartRunners") {
        await restartRunners(options);
      }
    }

    logger.debug("success", job);

    res.status(200).end();
  } catch (error) {
    logger.alert("worker failed", error);

    res.status(500).end();
  }
};

export default handleWorkerRequest;
