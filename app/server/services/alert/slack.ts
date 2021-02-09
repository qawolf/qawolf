import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";

import environment from "../../environment";
import { Logger } from "../../Logger";
import { findIntegration } from "../../models/integration";
import { findUsersForTeam } from "../../models/user";
import { Suite, SuiteRun, Trigger, User } from "../../types";
import { randomChoice } from "../../utils";

type BuildSuiteMessage = {
  runs: SuiteRun[];
  suite: Suite;
  trigger: Trigger;
  user: User | null;
};

type PostMessageToSlack = {
  message: IncomingWebhookSendArguments;
  webhook_url: string;
};

type SendSlackAlert = {
  logger: Logger;
  runs: SuiteRun[];
  suite: Suite;
  trigger: Trigger;
};

export const buildMessageForSuite = ({
  runs,
  suite,
  trigger,
  user,
}: BuildSuiteMessage): IncomingWebhookSendArguments => {
  const wolfName = user?.wolf_name || "Spirit";
  const wolfVariant = user?.wolf_variant || "white";

  const failingRuns = runs.filter((r) => r.status === "fail");

  const suiteHref = new URL(`/tests/${suite.id}`, environment.APP_URL).href;
  const headline = `${wolfName} here: <${suiteHref}|${trigger.name} tests> ${
    failingRuns.length ? "failed." : "passed!"
  }`;

  const runBlocks = failingRuns.map((run) => {
    return {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<${environment.APP_URL}/run/${run.id}|${run.test_name}>`,
      },
      accessory: {
        type: "image",
        image_url: run.gif_url,
        alt_text: run.test_name,
      },
    };
  });

  return {
    blocks: [
      {
        type: "context",
        elements: [
          {
            type: "image",
            image_url: `https://storage.googleapis.com/spirit-imgs/wolf-${wolfVariant}-slack.png`,
            alt_text: wolfName,
          },
          {
            type: "mrkdwn",
            text: headline,
          },
        ],
      },
      ...runBlocks,
    ],
  };
};

export const postMessageToSlack = async ({
  message,
  webhook_url,
}: PostMessageToSlack): Promise<void> => {
  const webhook = new IncomingWebhook(webhook_url);
  await webhook.send(message);
};

export const sendSlackAlert = async ({
  logger,
  runs,
  suite,
  trigger,
}: SendSlackAlert): Promise<void> => {
  const log = logger.prefix("sendSlackAlert");
  log.debug("suite", suite.id);

  try {
    const users = await findUsersForTeam(suite.team_id, { logger });
    const integration = await findIntegration(
      trigger.alert_integration_id || "",
      {
        logger,
      }
    );

    if (!integration.webhook_url) {
      log.error("no webhook url for integration", integration.id);
      throw new Error("No webhook url for Slack");
    }

    const user = users.length ? (randomChoice(users) as User) : null;

    await postMessageToSlack({
      message: buildMessageForSuite({ runs, suite, trigger, user }),
      webhook_url: integration.webhook_url,
    });
    log.debug("sent");
  } catch (error) {
    logger.alert("error: Slack alert", error.message);
  }
};
