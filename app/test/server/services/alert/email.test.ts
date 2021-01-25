import { db, dropTestDb, migrateDb } from "../../../../server/db";
import { Logger } from "../../../../server/Logger";
import { findRunsForSuite } from "../../../../server/models/run";
import * as email from "../../../../server/services/alert/email";
import { minutesFromNow } from "../../../../shared/utils";
import {
  buildGroup,
  buildRun,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildUser,
  logger,
} from "../../utils";

const { sendEmailAlert } = email;

const group = buildGroup({});
const user = buildUser({});

beforeAll(() => migrateDb());

afterAll(() => dropTestDb());

describe("sendEmailAlert", () => {
  beforeAll(async () => {
    jest.spyOn(email, "sendEmailForSuite").mockResolvedValue();

    await db("users").insert(user);
    await db("teams").insert(buildTeam({}));
    await db("team_users").insert(buildTeamUser({}));

    await db("groups").insert(group);

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
    const group = await db.select("*").from("groups").first();
    const suite = await db.select("*").from("suites").first();
    const runs = await findRunsForSuite(suite.id, { logger });

    await sendEmailAlert({ group, logger, runs, suite });
    const run = await db
      .select("*")
      .from("runs")
      .where({ id: "runId" })
      .first();

    expect(email.sendEmailForSuite).toBeCalledWith({
      group: {
        ...group,
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
          gif_url: expect.any(String),
        },
      ],
      suite_id: "suiteId",
      user: {
        ...user,
        created_at: expect.any(Date),
        onboarded_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
    });
  });
});
