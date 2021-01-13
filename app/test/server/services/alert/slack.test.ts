import { db, dropTestDb, migrateDb } from "../../../../server/db";
import { findRunsForSuite } from "../../../../server/models/run";
import * as slack from "../../../../server/services/alert/slack";
import * as azure from "../../../../server/services/aws/storage";
import { minutesFromNow } from "../../../../server/utils";
import {
  buildGroup,
  buildIntegration,
  buildRun,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildUser,
  logger,
} from "../../utils";

const { buildMessageForSuite, sendSlackAlert } = slack;

const group = buildGroup({ alert_integration_id: "integrationId" });
const integration = buildIntegration({});
const user = buildUser({});

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(user);
  await db("teams").insert(buildTeam({}));
  await db("team_users").insert(buildTeamUser({}));

  await db("integrations").insert(integration);
  await db("groups").insert(group);

  await db("suites").insert([buildSuite({})]);
  await db("tests").insert(buildTest({ name: "testName" }));
  return db("runs").insert([
    buildRun({
      completed_at: minutesFromNow(),
      status: "fail",
      suite_id: "suiteId",
    }),
    buildRun({
      completed_at: minutesFromNow(),
      i: 2,
      status: "pass",
      suite_id: "suiteId",
    }),
  ]);
});

afterAll(() => dropTestDb());

describe("buildMessageForSuite", () => {
  beforeAll(() => {
    jest.spyOn(azure, "createStorageReadAccessUrl").mockReturnValue("url");
  });

  afterAll(jest.restoreAllMocks);

  it("builds a Slack message for a failing suite", async () => {
    const group = await db.select("*").from("groups").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, { logger });

    expect(
      buildMessageForSuite({ group, runs, suite, user })
    ).toMatchSnapshot();
  });

  it("builds a Slack message for a passing suite", async () => {
    await db("runs").where({ id: "runId" }).update({ status: "pass" });

    const group = await db.select("*").from("groups").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, { logger });

    expect(
      buildMessageForSuite({ group, runs, suite, user })
    ).toMatchSnapshot();

    await db("runs").where({ id: "runId" }).update({ status: "fail" });
  });
});

describe("sendSlackAlert", () => {
  beforeAll(() => {
    jest.spyOn(slack, "postMessageToSlack").mockResolvedValue();
  });

  afterEach(jest.clearAllMocks);

  it("sends Slack alert", async () => {
    const group = await db.select("*").from("groups").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, { logger });

    await sendSlackAlert({ group, logger, runs, suite });

    expect(slack.postMessageToSlack).toBeCalledWith({
      message: buildMessageForSuite({ group, runs, suite, user }),
      webhook_url: integration.webhook_url,
    });
  });
});
