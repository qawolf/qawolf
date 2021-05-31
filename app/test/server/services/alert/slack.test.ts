import { findRunsForSuite } from "../../../../server/models/run";
import * as slack from "../../../../server/services/alert/slack";
import * as azure from "../../../../server/services/aws/storage";
import { minutesFromNow } from "../../../../shared/utils";
import { prepareTestDb } from "../../db";
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

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
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

describe("buildMessageForSuite", () => {
  beforeAll(() => {
    jest.spyOn(azure, "createStorageReadAccessUrl").mockReturnValue("url");
  });

  afterAll(jest.restoreAllMocks);

  it("builds a Slack message for a failing suite", async () => {
    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, options);

    expect(
      buildMessageForSuite({ runs, suite, trigger, user })
    ).toMatchSnapshot();
  });

  it("builds a Slack message for a passing suite", async () => {
    await db("runs").where({ id: "runId" }).update({ status: "pass" });

    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, options);

    expect(
      buildMessageForSuite({ runs, suite, trigger, user })
    ).toMatchSnapshot();

    expect(
      buildMessageForSuite({ runs, suite, trigger: null, user })
    ).toMatchSnapshot();

    await db("runs").where({ id: "runId" }).update({ status: "fail" });
  });

  it("builds a Slack message for a failing suite with git details", async () => {
    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, options);

    expect(
      buildMessageForSuite({
        runs,
        suite: {
          ...suite,
          branch: "feature",
          commit_message: "initial commit",
          commit_url:
            "https://github.com/qawolf/example/pull/123/commits/af2565c5cc30fac7bccfcf442994f6324da4fcd9",
          pull_request_url: "https://github.com/qawolf/example/pull/123",
        },
        trigger,
        user,
      })
    ).toMatchSnapshot();

    expect(
      buildMessageForSuite({
        runs,
        suite: {
          ...suite,
          branch: "feature",
          commit_message: "initial commit",
          commit_url:
            "https://github.com/qawolf/example/pull/123/commits/af2565c5cc30fac7bccfcf442994f6324da4fcd9",
        },
        trigger,
        user,
      })
    ).toMatchSnapshot();
  });
});

describe("sendSlackAlert", () => {
  let postMessageToSlackSpy: jest.SpyInstance;

  beforeAll(() => {
    postMessageToSlackSpy = jest
      .spyOn(slack, "postMessageToSlack")
      .mockResolvedValue();
  });

  afterEach(jest.clearAllMocks);

  it("sends Slack alert", async () => {
    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, options);

    await sendSlackAlert(
      {
        integrationId: "integrationId",
        runs,
        suite,
        trigger,
      },
      options
    );

    expect(postMessageToSlackSpy.mock.calls[0][0]).toEqual({
      message: buildMessageForSuite({ runs, suite, trigger, user }),
      webhook_url: integration.webhook_url,
    });
  });
});
