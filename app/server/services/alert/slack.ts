import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";

import environment from "../../environment";
import { Logger } from "../../Logger";
import { findIntegration } from "../../models/integration";
import { findUsersForTeam } from "../../models/user";
import { Group, Suite, SuiteRun, User } from "../../types";
import { randomChoice } from "../../utils";

type BuildSuiteMessage = {
  group: Group;
  runs: SuiteRun[];
  suite: Suite;
  user: User | null;
};

type PostMessageToSlack = {
  message: IncomingWebhookSendArguments;
  webhook_url: string;
};

type SendSlackAlert = {
  group: Group;
  logger: Logger;
  runs: SuiteRun[];
  suite: Suite;
};

export const buildMessageForSuite = ({
  group,
  runs,
  suite,
  user,
}: BuildSuiteMessage): IncomingWebhookSendArguments => {
  const wolfName = user?.wolf_name || "Spirit";
  const wolfVariant = user?.wolf_variant || "white";

  const failingRuns = runs.filter((r) => r.status === "fail");

  const suiteHref = new URL(`/tests/${suite.id}`, environment.APP_URL).href;
  const headline = `${wolfName} here: <${suiteHref}|${group.name} tests> ${
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
  group,
  logger,
  runs,
  suite,
}: SendSlackAlert): Promise<void> => {
  const log = logger.prefix("sendSlackAlert");
  log.debug("suite", suite.id);

  try {
    const users = await findUsersForTeam(suite.team_id, { logger });
    const integration = await findIntegration(
      group.alert_integration_id || "",
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
      message: buildMessageForSuite({ group, runs, suite, user }),
      webhook_url: integration.webhook_url,
    });
    log.debug("sent");
  } catch (error) {
    logger.alert("error: Slack alert", error.message);
  }
};
