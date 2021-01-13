import { WebhookEvents } from "@octokit/webhooks";
import { createHmac, timingSafeEqual } from "crypto";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import environment from "../../environment";
import { AuthenticationError } from "../../errors";
import { Logger } from "../../Logger";
import { handleCommitStatusEvent } from "./commit_status";
import { handleDeploymentStatusEvent } from "./deployment_status";

// https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/securing-your-webhooks
export const verifySignature = (req: NextApiRequest, logger: Logger): void => {
  const log = logger.prefix("verifySignature");

  const signature = req.headers["x-hub-signature-256"] as string;

  const expectedSignature =
    "sha256=" +
    createHmac("sha256", environment.GITHUB_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    log.error("invalid signature");
    throw new AuthenticationError("Unauthorized");
  }

  log.debug("valid signature");
};

export const handleGitHubRequest: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const logger = new Logger({ prefix: "handleGitHubRequest" });

  try {
    verifySignature(req, logger);
    const event = req.headers["x-github-event"] as WebhookEvents;
    logger.debug("event", event);

    switch (event) {
      case "deployment_status":
        await handleDeploymentStatusEvent({ logger, payload: req.body });
        break;
      case "status":
        await handleCommitStatusEvent({ logger, payload: req.body });
        break;
      default:
        logger.debug("ignore event", event);
    }

    res.status(200).end();
  } catch (error) {
    logger.alert("github error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};
