import axios from "axios";

import environment from "../../../server/environment";
import {
  createSlackIntegrationUrl,
  findSlackWebhook,
} from "../../../server/services/slack";
import { SlackWebhook } from "../../../server/types";
import { logger } from "../utils";

jest.mock("axios");

afterAll(jest.restoreAllMocks);

describe("createSlackIntegrationUrl", () => {
  it("creates URL to integrate with Slack", () => {
    const url = createSlackIntegrationUrl("/slack");

    expect(url).toMatch(
      `https://slack.com/oauth/v2/authorize?client_id=${environment.SLACK_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fslack&scope=incoming-webhook&state=`
    );
  });
});

describe("findSlackWebhook", () => {
  it("returns Slack webhook", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.post as any).mockResolvedValue({
      data: {
        incoming_webhook: {
          channel: "#channel",
          configuration_url: "configUrl",
          url: "url",
        },
        team: { name: "Awesome Team" },
      },
    });

    const webhook = await findSlackWebhook({
      logger,
      redirect_uri: "/slack",
      slack_code: "code",
    });

    expect(webhook).toEqual({
      settings_url: "configUrl",
      slack_channel: "#channel",
      slack_team: "Awesome Team",
      webhook_url: "url",
    });
  });

  it("throws an error if no access token returned by GitHub", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.post as any).mockRejectedValue(new Error("demogorgon!"));

    const testFn = async (): Promise<SlackWebhook> => {
      return findSlackWebhook({
        logger,
        redirect_uri: "/slack",
        slack_code: "code",
      });
    };

    await expect(testFn()).rejects.toThrowError("No webhook returned by Slack");
  });
});
