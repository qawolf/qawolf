import { decrypt, encrypt } from "../../../server/models/encrypt";
import {
  createSuite,
  createSuiteForTests,
  findSuite,
  findSuitesForTrigger,
  updateSuite,
} from "../../../server/models/suite";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildSuite,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const environment_variables = { secret: "shh" };

const trigger = buildTrigger({});

const test = buildTest({});
const test2 = buildTest({ i: 2 });

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("triggers").insert([trigger, buildTrigger({ i: 2 })]);
  await db("tests").insert([test, test2]);
});

describe("suite model", () => {
  describe("createSuite", () => {
    afterEach(() => db("suites").del());

    it("creates a new suite", async () => {
      await createSuite(
        { team_id: trigger.team_id, trigger_id: trigger.id },
        options
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: null,
          environment_variables: null,
          team_id: trigger.team_id,
          trigger_id: trigger.id,
          id: expect.any(String),
        },
      ]);
    });

    it("creates a new suite with specified creator and environment variables", async () => {
      await createSuite(
        {
          creator_id: trigger.creator_id,
          environment_variables,
          team_id: trigger.team_id,
          trigger_id: trigger.id,
        },
        options
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: trigger.creator_id,
          environment_variables: encrypt(JSON.stringify(environment_variables)),
          id: expect.any(String),
          team_id: trigger.team_id,
          trigger_id: trigger.id,
        },
      ]);

      expect(JSON.parse(decrypt(suites[0].environment_variables))).toEqual(
        environment_variables
      );
    });
  });

  describe("createSuiteForTests", () => {
    afterEach(async () => {
      await db("runs").del();
      return db("suites").del();
    });

    it("creates a suite and associated runs", async () => {
      await createSuiteForTests(
        {
          creator_id: "userId",
          environment_variables,
          team_id: "teamId",
          trigger_id: "triggerId",
          tests: [test, test2],
        },
        options
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: "userId",
          environment_variables: encrypt(JSON.stringify(environment_variables)),
          team_id: "teamId",
          trigger_id: "triggerId",
        },
      ]);

      const runs = await db.select("*").from("runs");
      expect(runs).toMatchObject([
        { suite_id: suites[0].id },
        { suite_id: suites[0].id },
      ]);
    });
  });

  describe("findSuite", () => {
    beforeAll(() => db("suites").insert(buildSuite({})));

    afterAll(() => db("suites").del());

    it("finds a suite", async () => {
      const suite = await findSuite("suiteId", options);

      expect(suite).toMatchObject({
        id: "suiteId",
        team_id: "teamId",
        trigger_id: "triggerId",
      });
    });

    it("throws an error if suite not found", async () => {
      await expect(findSuite("fakeId", options)).rejects.toThrowError(
        "not found"
      );
    });
  });

  describe("findSuitesForTrigger", () => {
    beforeAll(async () => {
      await db("suites").insert([
        buildSuite({}),
        buildSuite({
          created_at: new Date("2000").toISOString(),
          creator_id: "userId",
          i: 2,
        }),
        buildSuite({ i: 3, team_id: "team2Id", trigger_id: "trigger2Id" }),
      ]);
    });

    afterAll(() => db("suites").del());

    it("returns suites for a trigger", async () => {
      const suites = await findSuitesForTrigger(
        {
          limit: 20,
          trigger_id: "triggerId",
        },
        options
      );

      expect(suites).toMatchObject([
        {
          id: "suiteId",
          team_id: "teamId",
        },
        {
          id: "suite2Id",
          team_id: "teamId",
        },
      ]);
    });

    it("respects the specified limit", async () => {
      const suites = await findSuitesForTrigger(
        {
          limit: 1,
          trigger_id: "triggerId",
        },
        options
      );

      expect(suites).toMatchObject([
        {
          id: "suiteId",
          team_id: "teamId",
          trigger_id: "triggerId",
        },
      ]);
    });
  });

  describe("updateSuite", () => {
    beforeAll(async () => {
      await db("suites").insert(buildSuite({}));
    });

    afterAll(() => db("suites").del());

    it("updates alert_sent_at", async () => {
      const alert_sent_at = minutesFromNow();

      const suite = await updateSuite(
        { alert_sent_at, id: "suiteId" },
        options
      );

      expect(suite).toMatchObject({ alert_sent_at, id: "suiteId" });
    });
  });
});
