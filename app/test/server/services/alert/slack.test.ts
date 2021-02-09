import { db, dropTestDb, migrateDb } from "../../../../server/db";
import { findRunsForSuite } from "../../../../server/models/run";
import * as slack from "../../../../server/services/alert/slack";
import * as azure from "../../../../server/services/aws/storage";
import { minutesFromNow } from "../../../../shared/utils";
import {
  buildIntegration,
  buildRun,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const { buildMessageForSuite, sendSlackAlert } = slack;

const trigger = buildTrigger({});
const integration = buildIntegration({});
const user = buildUser({});

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(user);
  await db("teams").insert(buildTeam({}));
  await db("team_users").insert(buildTeamUser({}));

  await db("integrations").insert(integration);
  await db("teams").update({ alert_integration_id: "integrationId" });

  await db("triggers").insert(trigger);

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
    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, { logger });

    expect(
      buildMessageForSuite({ runs, suite, trigger, user })
    ).toMatchSnapshot();
  });

  it("builds a Slack message for a passing suite", async () => {
    await db("runs").where({ id: "runId" }).update({ status: "pass" });

    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, { logger });

    expect(
      buildMessageForSuite({ runs, suite, trigger, user })
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
    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, { logger });

    await sendSlackAlert({
      integrationId: "integrationId",
      logger,
      runs,
      suite,
      trigger,
    });

    expect(slack.postMessageToSlack).toBeCalledWith({
      message: buildMessageForSuite({ runs, suite, trigger, user }),
      webhook_url: integration.webhook_url,
    });
  });
});
