import { Logger } from "../../../../server/Logger";
import { findRunsForSuite } from "../../../../server/models/run";
import * as email from "../../../../server/services/alert/email";
import { minutesFromNow } from "../../../../shared/utils";
import { prepareTestDb } from "../../db";
import {
  buildRun,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const { sendEmailAlert } = email;

const trigger = buildTrigger({});
const user = buildUser({});

const db = prepareTestDb();
const options = { db, logger };

describe("buildFrom", () => {
  it("returns wolf email if possible", () => {
    expect(email.buildFrom("Oscar")).toEqual({
      email: "oscar@qawolf.com",
      name: "Oscar the QA Wolf",
    });
  });

  it("returns default email otherwise", () => {
    expect(email.buildFrom("This is invalid")).toEqual({
      email: "hello@qawolf.com",
      name: "This is invalid the QA Wolf",
    });
  });
});

describe("sendEmailAlert", () => {
  beforeAll(async () => {
    jest.spyOn(email, "sendEmailForSuite").mockResolvedValue();

    await db("users").insert(user);
    await db("teams").insert(buildTeam({}));
    await db("team_users").insert(buildTeamUser({}));

    await db("triggers").insert(trigger);

    await db("suites").insert([buildSuite({})]);
    await db("tests").insert(buildTest({ name: "testName" }));
    return db("runs").insert(
      buildRun({
        completed_at: minutesFromNow(),
        status: "fail",
        suite_id: "suiteId",
      })
    );
  });

  afterEach(jest.clearAllMocks);

  afterAll(async () => {
    await db.del();
  });

  it("sends email alert", async () => {
    const trigger = await db.select("*").from("triggers").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, options);

    await sendEmailAlert({ runs, suite, trigger }, options);
    const run = await db
      .select("*")
      .from("runs")
      .where({ id: "runId" })
      .first();

    expect(email.sendEmailForSuite).toBeCalledWith({
      trigger: {
        ...trigger,
        created_at: expect.any(Date),
        deleted_at: null,
        updated_at: expect.any(Date),
      },
      logger: expect.any(Logger),
      runs: [
        {
          ...run,
          is_test_deleted: false,
          test_deleted_at: null,
          test_id: "testId",
          test_name: "testName",
          test_path: null,
          gif_url: expect.any(String),
        },
      ],
      suite_id: "suiteId",
      user: {
        ...user,
        created_at: expect.any(Date),
        last_seen_at: expect.any(Date),
        onboarded_at: expect.any(Date),
        subscribed_at: null,
        updated_at: expect.any(Date),
      },
    });
  });
});
