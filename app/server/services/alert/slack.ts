import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
import last from "lodash/last";

import environment from "../../environment";
import { findIntegration } from "../../models/integration";
import { findUsersForTeam } from "../../models/user";
import { ModelOptions, Suite, SuiteRun, Trigger, User } from "../../types";
import { randomChoice } from "../../utils";

type BuildSuiteMessage = {
  runs: SuiteRun[];
  suite: Suite;
  trigger: Trigger | null;
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
  trigger: Trigger | null;
};

const buildSuiteDetailBlocks = (
  suite: Suite,
  isPass: boolean
): IncomingWebhookSendArguments["blocks"] => {
  if (!suite.commit_url) return [];

  const emoji = isPass ? "✅" : "❌";
  const sha = last(suite.commit_url.split("/")).slice(0, 7);
  const pullRequestId = suite.pull_request_url
    ? last(suite.pull_request_url.split("/"))
    : null;

  const branch = suite.branch ? `${suite.branch}, ` : "";
  const pullRequest = pullRequestId
    ? ` (<${suite.pull_request_url}|#${pullRequestId}>)`
    : "";

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${emoji} <${suite.commit_url}|${sha}>: ${branch}${
          suite.commit_message || ""
        }${pullRequest}`,
      },
    },
  ];
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

  const triggerName = trigger?.name || "manually triggered";

  const suiteHref = new URL(`/suites/${suite.id}`, environment.APP_URL).href;
  const headline = `${wolfName} here: <${suiteHref}|${triggerName} tests> ${status}`;
  const text = `${triggerName} tests ${status}`;

  const runBlocks = failingRuns.map((run) => {
    return {
      type: "section",
      text: {
        text: `<${environment.APP_URL}/run/${run.id}|${run.test_name}>`,
        type: "mrkdwn",
      },
      accessory: {
        alt_text: run.test_name,
        image_url: run.gif_url,
        type: "image",
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
            image_url: `https://qawolf-public.s3.us-east-2.amazonaws.com/wolf-${wolfVariant}${
              failingRuns.length ? "" : "-party"
            }-slack.png`,
            alt_text: wolfName,
          },
          {
            type: "mrkdwn",
            text: headline,
          },
        ],
      },
      ...buildSuiteDetailBlocks(suite, !failingRuns.length),
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
