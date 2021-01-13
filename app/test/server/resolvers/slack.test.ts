import { db, dropTestDb, migrateDb } from "../../../server/db";
import environment from "../../../server/environment";
import {
  createSlackIntegrationResolver,
  createSlackIntegrationUrlResolver,
} from "../../../server/resolvers/slack";
import * as slackService from "../../../server/services/slack";
import {
  buildGroup,
  buildTeam,
  buildTeamUser,
  buildUser,
  logger,
} from "../utils";

const teams = [buildTeam({})];
const user = buildUser({});

const testContext = { api_key: null, ip: null, logger, teams, user };

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));

  await db("groups").insert(buildGroup({}));
});

afterAll(() => dropTestDb());

describe("createSlackIntegrationResolver", () => {
  afterAll(async () => {
    jest.restoreAllMocks();

    await db("groups").update({
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

    const oldGroup = await db.select("*").from("groups").first();
    expect(oldGroup).toMatchObject({
      is_email_enabled: true,
      alert_integration_id: null,
    });

    await createSlackIntegrationResolver(
      {},
      {
        group_id: "groupId",
        redirect_uri: "/slack",
        slack_code: "code",
      },
      testContext
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

    const group = await db.select("*").from("groups").first();
    expect(group).toMatchObject({
      is_email_enabled: false,
      alert_integration_id: integrations[0].id,
    });
  });
});

describe("createSlackIntegrationUrlResolver", () => {
  it("creates a Slack integration url", () => {
    const url = createSlackIntegrationUrlResolver(
      {},
      { redirect_uri: "/slack" },
      testContext
    );

    expect(url).toMatch(
      `https://slack.com/oauth/v2/authorize?client_id=${environment.SLACK_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fslack&scope=incoming-webhook&state=`
    );
  });
});
