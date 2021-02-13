import environment from "../../../server/environment";
import {
  createSlackIntegrationResolver,
  createSlackIntegrationUrlResolver,
} from "../../../server/resolvers/slack";
import * as slackService from "../../../server/services/slack";
import { prepareTestDb } from "../db";
import { buildTeam, buildTeamUser, buildUser, testContext } from "../utils";

const teams = [buildTeam({})];
const user = buildUser({});

const db = prepareTestDb();
const context = { ...testContext, api_key: "apiKey", db };

beforeAll(async () => {
  await db("users").insert(user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));
});

describe("createSlackIntegrationResolver", () => {
  afterAll(async () => {
    jest.restoreAllMocks();

    await db("triggers").update({
      is_email_enabled: true,
      alert_integration_id: null,
    });
    await db("integrations").del();
  });

  it("creates a Slack integration", async () => {
    jest.spyOn(slackService, "findSlackWebhook").mockResolvedValue({
      settings_url: "settingsUrl",
      slack_channel: "#channel",
      slack_team: "QA Wolf",
      webhook_url: "webhookUrl",
    });

    const oldTeam = await db.select("*").from("teams").first();
    expect(oldTeam).toMatchObject({
      is_email_alert_enabled: true,
      alert_integration_id: null,
    });

    await createSlackIntegrationResolver(
      {},
      {
        redirect_uri: "/slack",
        slack_code: "code",
        team_id: "teamId",
      },
      context
    );

    const integrations = await db.select("*").from("integrations");
    expect(integrations).toMatchObject([
      {
        settings_url: "settingsUrl",
        slack_channel: "#channel",
        team_id: "teamId",
        team_name: "QA Wolf",
        type: "slack",
        webhook_url: "webhookUrl",
      },
    ]);

    const team = await db.select("*").from("teams").first();
    expect(team).toMatchObject({
      alert_integration_id: integrations[0].id,
      is_email_alert_enabled: false,
    });
  });
});

describe("createSlackIntegrationUrlResolver", () => {
  it("creates a Slack integration url", () => {
    const url = createSlackIntegrationUrlResolver(
      {},
      { redirect_uri: "/slack" },
      context
    );

    expect(url).toMatch(
      `https://slack.com/oauth/v2/authorize?client_id=${environment.SLACK_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fslack&scope=incoming-webhook&state=`
    );
  });
});
