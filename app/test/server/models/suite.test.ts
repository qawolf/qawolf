import { decrypt, encrypt } from "../../../server/models/encrypt";
import {
  buildTestsForSuite,
  createSuite,
  createSuiteForTests,
  findSuite,
  findSuitesForTeam,
} from "../../../server/models/suite";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildSuite,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const environment_variables = { secret: "shh" };

const trigger = buildTrigger({ environment_id: "environmentId" });

const test = buildTest({});
const test2 = buildTest({ i: 2 });

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert([
    buildTeam({ helpers: "// helpers" }),
    buildTeam({ i: 2 }),
  ]);

  await db("environments").insert(buildEnvironment({}));
  await db("triggers").insert([trigger, buildTrigger({ i: 2 })]);

  await db("tests").insert([test, test2]);
});

describe("suite model", () => {
  describe("buildTestsForSuite", () => {
    it("returns helpers and tests as is if no branch", async () => {
      const { helpers, tests } = await buildTestsForSuite(
        { team_id: "teamId", tests: [test, test2] },
        options
      );

      expect(helpers).toBe("// helpers");
      expect(tests).toEqual([test, test2]);
    });
  });

  describe("createSuite", () => {
    afterEach(() => db("suites").del());

    it("creates a new suite", async () => {
      await createSuite(
        {
          helpers: "// helpers",
          environment_id: null,
          team_id: trigger.team_id,
          trigger_id: trigger.id,
        },
        options
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          branch: null,
          creator_id: null,
          environment_id: null,
          environment_variables: null,
          helpers: "// helpers",
          team_id: trigger.team_id,
          trigger_id: trigger.id,
          id: expect.any(String),
        },
      ]);
    });

    it("creates a new suite with specified branch, creator, and environment", async () => {
      await createSuite(
        {
          branch: "feature",
          creator_id: trigger.creator_id,
          environment_id: "environmentId",
          environment_variables,
          helpers: "// helpers",
          team_id: trigger.team_id,
          trigger_id: trigger.id,
        },
        options
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          branch: "feature",
          creator_id: trigger.creator_id,
          environment_id: "environmentId",
          environment_variables: encrypt(JSON.stringify(environment_variables)),
          helpers: "// helpers",
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

    it("creates a suite and associated runs for a trigger", async () => {
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
          environment_id: "environmentId",
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

    it("creates a suite and associated runs without trigger", async () => {
      await createSuiteForTests(
        {
          creator_id: "userId",
          environment_id: "environmentId",
          environment_variables: null,
          team_id: "teamId",
          tests: [test],
        },
        options
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: "userId",
          environment_id: "environmentId",
          environment_variables: null,
          team_id: "teamId",
          trigger_id: null,
        },
      ]);

      const runs = await db.select("*").from("runs");
      expect(runs).toMatchObject([{ suite_id: suites[0].id }]);
    });

    it("creates a suite and associated runs without trigger or environment", async () => {
      await createSuiteForTests(
        {
          creator_id: "userId",
          environment_variables: null,
          team_id: "teamId",
          tests: [test],
        },
        options
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: "userId",
          environment_id: null,
          environment_variables: null,
          team_id: "teamId",
          trigger_id: null,
        },
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

  describe("findSuitesForTeam", () => {
    beforeAll(async () => {
      await db("suites").insert([
        buildSuite({
          created_at: new Date("2020").toISOString(),
          environment_id: "environmentId",
        }),
        buildSuite({ i: 2, team_id: "team2Id" }),
        buildSuite({ i: 3, trigger_id: "triggerId" }),
      ]);

      return db("suites").where({ id: "suiteId" }).update({ trigger_id: null });
    });

    afterAll(() => db("suites").del());

    it("finds suites for a team", async () => {
      const suites = await findSuitesForTeam(
        { limit: 5, team_id: "teamId" },
        options
      );

      expect(suites).toMatchObject([
        {
          id: "suite3Id",
          environment_name: null,
          trigger: {
            color: "#4545E5",
            id: "triggerId",
            name: "trigger1",
          },
        },
        {
          id: "suiteId",
          environment_name: "Staging",
          trigger: null,
        },
      ]);
    });

    it("respects the specified limit", async () => {
      const suites = await findSuitesForTeam(
        { limit: 1, team_id: "teamId" },
        options
      );

      expect(suites).toMatchObject([
        {
          id: "suite3Id",
          environment_name: null,
          trigger: {
            color: "#4545E5",
            id: "triggerId",
            name: "trigger1",
          },
        },
      ]);
    });
  });
});
