import * as email from "../../../../server/services/alert/email";
import {
  sendAlert,
  shouldSendAlert,
} from "../../../../server/services/alert/send";
import * as slack from "../../../../server/services/alert/slack";
import { SuiteRun } from "../../../../server/types";
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

const user = buildUser({});

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(user);
  await db("teams").insert(buildTeam({}));
  await db("team_users").insert(buildTeamUser({}));

  await db("triggers").insert(buildTrigger({}));
  await db("integrations").insert(buildIntegration({}));

  await db("suites").insert([
    buildSuite({}),
    buildSuite({ i: 2 }),
    buildSuite({ i: 3 }),
    buildSuite({ i: 4 }),
  ]);
  await db("tests").insert(buildTest({ name: "testName" }));
  return db("runs").insert([
    buildRun({ status: "created", suite_id: "suiteId" }),
    buildRun({
      completed_at: minutesFromNow(),
      i: 2,
      status: "fail",
      suite_id: "suite3Id",
    }),
    buildRun({
      completed_at: minutesFromNow(),
      i: 3,
      status: "pass",
      suite_id: "suite4Id",
    }),
  ]);
});

describe("sendAlert", () => {
  beforeAll(() => {
    jest.spyOn(email, "sendEmailAlert").mockResolvedValue();
    jest.spyOn(slack, "sendSlackAlert").mockResolvedValue();
  });

  afterEach(jest.clearAllMocks);

  afterAll(jest.restoreAllMocks);

  it("sends email alert per team settings", async () => {
    await sendAlert("suite3Id", options);
    expect(email.sendEmailAlert).toBeCalledTimes(1);
    expect(slack.sendSlackAlert).not.toBeCalled();

    // check it does not send it again
    await sendAlert("suiteId", options);
    expect(email.sendEmailAlert).toBeCalledTimes(1);
  });

  it("sends Slack alert per team settings", async () => {
    await db("teams").update({ alert_integration_id: "integrationId" });

    await sendAlert("suite3Id", options);
    expect(email.sendEmailAlert).toBeCalled();
    expect(slack.sendSlackAlert).toBeCalled();

    await db("teams").update({ alert_integration_id: null });
  });

  it("does not send alerts if suite not complete", async () => {
    await sendAlert("suiteId", options);

    expect(email.sendEmailAlert).not.toBeCalled();
    expect(slack.sendSlackAlert).not.toBeCalled();
  });

  it("does not send alert if alert only on failure enabled and runs passed", async () => {
    await db("teams").update({ alert_only_on_failure: true });

    await sendAlert("suite4Id", options);
    expect(email.sendEmailAlert).not.toBeCalled();
    expect(slack.sendSlackAlert).not.toBeCalled();

    await db("teams").update({ alert_only_on_failure: false });
  });

  it("sends alert if alert only on failure enabled but runs failed", async () => {
    await db("teams").update({ alert_only_on_failure: true });

    await sendAlert("suite3Id", options);
    expect(email.sendEmailAlert).toBeCalled();
    expect(slack.sendSlackAlert).not.toBeCalled();

    await db("teams").update({ alert_only_on_failure: false });
  });
});

describe("shouldSendAlert", () => {
  const team = buildTeam({});
  const runFail = { status: "fail" } as SuiteRun;
  const runPass = { status: "pass" } as SuiteRun;

  it("returns true if alert only on failure disabled and all runs passed", async () => {
    expect(
      shouldSendAlert({
        runs: [runPass],
        team: { ...team, alert_only_on_failure: false },
      })
    ).toBe(true);
  });

  it("returns false if should alert only on failure enabled and all runs passsed", async () => {
    expect(
      shouldSendAlert({
        runs: [runPass],
        team: { ...team, alert_only_on_failure: true },
      })
    ).toBe(false);
  });

  it("returns true if should alert only on failure enabled but some runs failed", async () => {
    expect(
      shouldSendAlert({
        runs: [runPass, runFail],
        team: { ...team, alert_only_on_failure: true },
      })
    ).toBe(true);
  });
});
