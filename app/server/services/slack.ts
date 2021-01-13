import axios from "axios";
import querystring from "querystring";

import environment from "../environment";
import { Logger } from "../Logger";
import { SlackWebhook } from "../types";
import { cuid } from "../utils";

type FindSlackWebhook = {
  logger: Logger;
  redirect_uri: string;
  slack_code: string;
};

type SlackWebhookData = {
  data: {
    incoming_webhook: {
      channel: string;
      configuration_url: string;
      url: string;
    };
    team: { name: string };
  };
};

const SLACK_ACCESS_URL = "https://slack.com/api/oauth.v2.access";
const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";

const buildSlackWebhook = (data: SlackWebhookData["data"]): SlackWebhook => {
  return {
    settings_url: data.incoming_webhook.configuration_url,
    slack_channel: data.incoming_webhook.channel,
    slack_team: data.team.name,
    webhook_url: data.incoming_webhook.url,
  };
};

// Slack documentation
// https://api.slack.com/legacy/oauth#authenticating-users-with-oauth__the-oauth-flow__step-1---sending-users-to-authorize-andor-install
export const createSlackIntegrationUrl = (redirect_uri: string): string => {
  const queryString = querystring.stringify({
    client_id: environment.SLACK_CLIENT_ID,
    redirect_uri: new URL(redirect_uri, environment.APP_URL).href,
    scope: "incoming-webhook",
    state: cuid(),
  });

  return `${SLACK_AUTHORIZE_URL}?${queryString}`;
};

// Slack documentation https://api.slack.com/methods/oauth.v2.access
export const findSlackWebhook = async ({
  logger,
  redirect_uri,
  slack_code,
}: FindSlackWebhook): Promise<SlackWebhook> => {
  const log = logger.prefix("findSlackWebhook");

  try {
    const { data }: SlackWebhookData = await axios.post(
      SLACK_ACCESS_URL,
      querystring.stringify({
        code: slack_code,
        redirect_uri: new URL(redirect_uri, environment.APP_URL).href,
      }),
      {
        auth: {
          password: environment.SLACK_CLIENT_SECRET,
          username: environment.SLACK_CLIENT_ID,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    log.debug(
      `webhook channel ${data.incoming_webhook.channel} and team ${data.team.name}`
    );

    return buildSlackWebhook(data);
  } catch (error) {
    log.error("error", error);
    throw new Error("No webhook returned by Slack");
  }
};
