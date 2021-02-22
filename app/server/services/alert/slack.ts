import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";

import environment from "../../environment";
import { findIntegration } from "../../models/integration";
import { findUsersForTeam } from "../../models/user";
import { ModelOptions, Suite, SuiteRun, Trigger, User } from "../../types";
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
  integrationId: string;
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

  const status = failingRuns.length ? "failed." : "passed!";

  const suiteHref = new URL(`/tests/${suite.id}`, environment.APP_URL).href;
  const headline = `${wolfName} here: <${suiteHref}|${trigger.name} tests> ${status}`;
  const text = `${trigger.name} tests ${status}`;

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
            image_url: `'https://qawolf-public.s3.us-east-2.amazonaws.com/wolf-${wolfVariant}.png'`,
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
    text,
  };
};

export const postMessageToSlack = async ({
  message,
  webhook_url,
}: PostMessageToSlack): Promise<void> => {
  const webhook = new IncomingWebhook(webhook_url);
  await webhook.send(message);
};

export const sendSlackAlert = async (
  { integrationId, runs, suite, trigger }: SendSlackAlert,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("sendSlackAlert");
  log.debug("suite", suite.id);

  try {
    const users = await findUsersForTeam(suite.team_id, options);
    const integration = await findIntegration(integrationId, options);

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
    log.alert("error: Slack alert", error.message);
  }
};
