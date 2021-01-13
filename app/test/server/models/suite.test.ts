import { db, dropTestDb, migrateDb } from "../../../server/db";
import { decrypt, encrypt } from "../../../server/models/encrypt";
import {
  createSuite,
  createSuiteForTests,
  findSuite,
  findSuitesForGroup,
  updateSuite,
} from "../../../server/models/suite";
import { Suite } from "../../../server/types";
import { minutesFromNow } from "../../../server/utils";
import {
  buildGroup,
  buildSuite,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const environment_variables = { secret: "shh" };

const group = buildGroup({});

const test = buildTest({});
const test2 = buildTest({ i: 2 });

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("groups").insert([group, buildGroup({ i: 2 })]);
  await db("tests").insert([test, test2]);
});

afterAll(() => dropTestDb());

describe("suite model", () => {
  describe("createSuite", () => {
    afterEach(() => db("suites").del());

    it("creates a new suite", async () => {
      await createSuite(
        { group_id: group.id, team_id: group.team_id },
        { logger }
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: null,
          environment_variables: null,
          group_id: group.id,
          team_id: group.team_id,
          id: expect.any(String),
        },
      ]);
    });

    it("creates a new suite with specified creator and environment variables", async () => {
      await createSuite(
        {
          creator_id: group.creator_id,
          environment_variables,
          group_id: group.id,
          team_id: group.team_id,
        },
        { logger }
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: group.creator_id,
          environment_variables: encrypt(JSON.stringify(environment_variables)),
          group_id: group.id,
          team_id: group.team_id,
          id: expect.any(String),
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
          group_id: "groupId",
          team_id: "teamId",
          tests: [test, test2],
        },
        { logger }
      );

      const suites = await db.select("*").from("suites");
      expect(suites).toMatchObject([
        {
          creator_id: "userId",
          environment_variables: encrypt(JSON.stringify(environment_variables)),
          group_id: "groupId",
          team_id: "teamId",
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
      const suite = await findSuite("suiteId", { logger });

      expect(suite).toMatchObject({
        team_id: "teamId",
        id: "suiteId",
        group_id: "groupId",
      });
    });

    it("throws an error if suite not found", async () => {
      const testFn = async (): Promise<Suite> => {
        return findSuite("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });
  });

  describe("findSuitesForGroup", () => {
    beforeAll(async () => {
      await db("suites").insert([
        buildSuite({}),
        buildSuite({
          created_at: new Date("2000").toISOString(),
          creator_id: "userId",
          i: 2,
        }),
        buildSuite({ group_id: "group2Id", team_id: "team2Id", i: 3 }),
      ]);
    });

    afterAll(() => db("suites").del());

    it("returns suites for a group", async () => {
      const suites = await findSuitesForGroup(
        {
          group_id: "groupId",
          limit: 20,
        },
        logger
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
      const suites = await findSuitesForGroup(
        {
          group_id: "groupId",
          limit: 1,
        },
        logger
      );

      expect(suites).toMatchObject([
        {
          group_id: "groupId",
          id: "suiteId",
          team_id: "teamId",
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
        { logger }
      );

      expect(suite).toMatchObject({ alert_sent_at, id: "suiteId" });
    });
  });
});
