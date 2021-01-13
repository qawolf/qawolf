import { db, dropTestDb, migrateDb } from "../../../../server/db";
import { updateSuite } from "../../../../server/models/suite";
import * as email from "../../../../server/services/alert/email";
import { sendAlert } from "../../../../server/services/alert/send";
import * as slack from "../../../../server/services/alert/slack";
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

const group = buildGroup({});
const user = buildUser({});

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(user);
  await db("teams").insert(buildTeam({}));
  await db("team_users").insert(buildTeamUser({}));

  await db("groups").insert(group);
  await db("integrations").insert(buildIntegration({}));

  await db("suites").insert([
    buildSuite({}),
    buildSuite({ i: 2 }),
    buildSuite({ i: 3 }),
    buildSuite({ i: 4 }),
    buildSuite({ alert_sent_at: minutesFromNow(), i: 5 }),
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

afterAll(() => dropTestDb());

describe("sendAlert", () => {
  beforeAll(() => {
    jest.spyOn(email, "sendEmailAlert").mockResolvedValue();
    jest.spyOn(slack, "sendSlackAlert").mockResolvedValue();
  });

  afterEach(jest.clearAllMocks);

  afterAll(jest.restoreAllMocks);

  it("sends email alert per group settings", async () => {
    await sendAlert({ logger, suite_id: "suite3Id" });
    expect(email.sendEmailAlert).toBeCalledTimes(1);
    expect(slack.sendSlackAlert).not.toBeCalled();

    // check it does not send it again
    await sendAlert({ logger, suite_id: "suiteId" });
    expect(email.sendEmailAlert).toBeCalledTimes(1);
  });

  it("sends Slack alert per group settings", async () => {
    await updateSuite({ alert_sent_at: null, id: "suite3Id" }, { logger });
    await db("groups").update({ alert_integration_id: "integrationId" });

    await sendAlert({ logger, suite_id: "suite3Id" });
    expect(email.sendEmailAlert).toBeCalled();
    expect(slack.sendSlackAlert).toBeCalled();

    await db("groups").update({ alert_integration_id: null });
  });

  it("does not send alerts if suite not complete", async () => {
    await sendAlert({ logger, suite_id: "suiteId" });

    expect(email.sendEmailAlert).not.toBeCalled();
    expect(slack.sendSlackAlert).not.toBeCalled();
  });

  it("does not send alerts per group settings", async () => {
    await db("groups").update({ is_email_enabled: false });

    await sendAlert({ logger, suite_id: "suite3Id" });
    expect(email.sendEmailAlert).not.toBeCalled();
    expect(slack.sendSlackAlert).not.toBeCalled();

    await db("groups").update({ is_email_enabled: true });
  });
});
