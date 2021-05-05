import {
  createTestTriggersForTrigger,
  deleteTestTriggersForTests,
  deleteTestTriggersForTrigger,
  findTestTriggersForTests,
  hasTestTrigger,
} from "../../../server/models/test_trigger";
import { prepareTestDb } from "../db";
import {
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

describe("test trigger model", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({}));
    await db("tests").insert(buildTest({}));
    return db("triggers").insert(buildTrigger({}));
  });

  describe("createTestTriggersForTrigger", () => {
    beforeAll(async () => {
      await db("triggers").insert(buildTrigger({ i: 2 }));
      return db("tests").insert([
        buildTest({ i: 2 }),
        buildTest({ i: 3 }),
        buildTest({ i: 4 }),
      ]);
    });

    afterEach(() => db("test_triggers").del());

    afterAll(async () => {
      await db("triggers").where({ id: "trigger2Id" }).del();
      return db("tests").whereIn("id", ["test2Id", "test3Id", "test4Id"]).del();
    });

    it("creates test triggers for a trigger", async () => {
      const result = await createTestTriggersForTrigger(
        { test_ids: ["test2Id", "test3Id"], trigger_id: "trigger2Id" },
        options
      );

      expect(result).toHaveLength(2);

      const testTriggers = await db
        .select("*")
        .from("test_triggers")
        .orderBy("test_id", "asc");
      expect(testTriggers).toMatchObject([
        { test_id: "test2Id", trigger_id: "trigger2Id" },
        { test_id: "test3Id", trigger_id: "trigger2Id" },
      ]);
    });

    it("handles pre-existing test triggers", async () => {
      await db("test_triggers").insert({
        id: "testTriggerId",
        test_id: "test2Id",
        trigger_id: "trigger2Id",
      });

      const result = await createTestTriggersForTrigger(
        { test_ids: ["test2Id", "test3Id"], trigger_id: "trigger2Id" },
        options
      );

      expect(result).toHaveLength(1);

      const testTriggers = await db
        .select("*")
        .from("test_triggers")
        .orderBy("test_id", "asc");
      expect(testTriggers).toMatchObject([
        { test_id: "test2Id", trigger_id: "trigger2Id" },
        { test_id: "test3Id", trigger_id: "trigger2Id" },
      ]);
    });
  });

  describe("deleteTestTriggersForTrigger", () => {
    beforeAll(async () => {
      await db("triggers").insert([
        buildTrigger({ i: 2 }),
        buildTrigger({ i: 3 }),
      ]);
      return db("tests").insert([buildTest({ i: 2 }), buildTest({ i: 3 })]);
    });

    beforeEach(async () => {
      return db("test_triggers").insert([
        { id: "testTriggerId", test_id: "test2Id", trigger_id: "triggerId" },
        { id: "testTrigger2Id", test_id: "test2Id", trigger_id: "trigger2Id" },
        { id: "testTrigger3Id", test_id: "test3Id", trigger_id: "trigger2Id" },
      ]);
    });

    afterEach(() => db("test_triggers").del());

    afterAll(async () => {
      await db("triggers").whereIn("id", ["trigger2Id", "trigger3Id"]).del();
      return db("tests").whereIn("id", ["test2Id", "test3Id"]).del();
    });

    it("deletes test triggers for specified trigger", async () => {
      const deleteCount = await deleteTestTriggersForTrigger(
        { trigger_id: "trigger2Id" },
        options
      );
      expect(deleteCount).toBe(2);

      const testTriggers = await db.select("*").from("test_triggers");

      expect(testTriggers).toMatchObject([{ id: "testTriggerId" }]);
    });

    it("deletes test triggers for specified trigger and test ids", async () => {
      const deleteCount = await deleteTestTriggersForTrigger(
        { test_ids: ["test3Id"], trigger_id: "trigger2Id" },
        options
      );
      expect(deleteCount).toBe(1);

      const testTriggers = await db.select("*").from("test_triggers");

      expect(testTriggers).toMatchObject([
        { id: "testTriggerId" },
        { id: "testTrigger2Id" },
      ]);
    });
  });

  describe("deleteTestTriggersForTests", () => {
    beforeAll(async () => {
      await db("triggers").insert(buildTrigger({ i: 2 }));

      await db("tests").insert([
        buildTest({ i: 2 }),
        buildTest({ i: 3 }),
        buildTest({ i: 4 }),
      ]);

      return db("test_triggers").insert([
        { id: "testTriggerId", test_id: "test2Id", trigger_id: "triggerId" },
        { id: "testTrigger2Id", test_id: "test2Id", trigger_id: "trigger2Id" },
        { id: "testTrigger3Id", test_id: "test3Id", trigger_id: "triggerId" },
        { id: "testTrigger4Id", test_id: "testId", trigger_id: "triggerId" },
      ]);
    });

    afterAll(async () => {
      await db("test_triggers").del();
      await db("triggers").where({ id: "trigger2Id" }).del();

      return db("tests").whereIn("id", ["test2Id", "test3Id", "test4Id"]).del();
    });

    it("deletes test triggers for specified tests", async () => {
      await deleteTestTriggersForTests(["test2Id", "test3Id"], options);

      const testTriggers = await db.select("*").from("test_triggers");

      expect(testTriggers).toMatchObject([{ id: "testTrigger4Id" }]);
    });
  });

  describe("findTestTriggersForTests", () => {
    beforeAll(async () => {
      await db("triggers").insert([
        buildTrigger({ i: 2 }),
        buildTrigger({ i: 3 }),
        buildTrigger({ i: 4 }),
        {
          ...buildTrigger({}),
          deleted_at: new Date().toISOString(),
          id: "deletedTriggerId",
        },
      ]);

      await db("tests").insert([buildTest({ i: 2 }), buildTest({ i: 3 })]);

      return db("test_triggers").insert([
        { id: "testTriggerId", test_id: "testId", trigger_id: "triggerId" },
        { id: "testTrigger2Id", test_id: "testId", trigger_id: "trigger2Id" },
        {
          id: "testTrigger3Id",
          test_id: "testId",
          trigger_id: "deletedTriggerId",
        },
        { id: "testTrigger4Id", test_id: "test2Id", trigger_id: "trigger3Id" },
        { id: "testTrigger5Id", test_id: "testId", trigger_id: "trigger4Id" },
      ]);
    });

    afterAll(async () => {
      await db("test_triggers").del();
      await db("triggers").whereNot({ id: "triggerId" }).del();

      return db("tests").whereNot({ id: "testId" }).del();
    });

    it("finds test triggers for tests", async () => {
      const testTriggers = await findTestTriggersForTests(
        ["testId", "test2Id", "test3Id"],
        options
      );

      testTriggers.sort((a, b) => {
        return a.test_id.length - b.test_id.length;
      });
      testTriggers[0].trigger_ids.sort();

      expect(testTriggers).toEqual([
        {
          test_id: "testId",
          trigger_ids: ["trigger2Id", "trigger4Id", "triggerId"],
        },
        { test_id: "test2Id", trigger_ids: ["trigger3Id"] },
        { test_id: "test3Id", trigger_ids: [] },
      ]);
    });
  });

  describe("hasTestTrigger", () => {
    beforeAll(async () => {
      await db("test_triggers").insert({
        id: "testTriggerId",
        test_id: "testId",
        trigger_id: "triggerId",
      });

      return db("teams").insert(buildTeam({ i: 2 }));
    });

    afterAll(async () => {
      await db("test_triggers").del();

      return db("teams").where({ id: "team2Id" }).del();
    });

    it("returns true if team has test trigger", async () => {
      expect(await hasTestTrigger("teamId", options)).toBe(true);
    });

    it("returns false if team does not have test trigger", async () => {
      expect(await hasTestTrigger("team2Id", options)).toBe(false);
    });
  });
});
