import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createGroupTest,
  createGroupTestsForGroup,
  deleteGroupTestsForGroup,
  deleteGroupTestsForTests,
} from "../../../server/models/group_test";
import { GroupTest } from "../../../server/types";
import { buildGroup, buildTeam, buildTest, buildUser, logger } from "../utils";

describe("group test model", () => {
  beforeAll(async () => {
    await migrateDb();

    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({}));
    await db("tests").insert(buildTest({}));
    return db("groups").insert(buildGroup({}));
  });

  afterAll(() => dropTestDb());

  describe("createGroupTest", () => {
    afterEach(() => db("group_tests").del());

    it("creates a group test", async () => {
      await db.transaction(async (trx) => {
        return createGroupTest(
          { group_id: "groupId", test_id: "testId" },
          { logger, trx }
        );
      });

      const groupTests = await db.select("*").from("group_tests");

      expect(groupTests).toMatchObject([
        {
          group_id: "groupId",
          id: expect.any(String),
          test_id: "testId",
        },
      ]);
    });

    it("does not create team user if user already on team", async () => {
      await createGroupTest(
        { group_id: "groupId", test_id: "testId" },
        { logger }
      );

      const testFn = async (): Promise<GroupTest> => {
        return createGroupTest(
          { group_id: "groupId", test_id: "testId" },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("unique constraint");
    });
  });

  describe("createGroupTestsForGroup", () => {
    beforeAll(async () => {
      await db("groups").insert(buildGroup({ i: 2 }));
      return db("tests").insert([
        buildTest({ i: 2 }),
        buildTest({ i: 3 }),
        buildTest({ i: 4 }),
      ]);
    });

    afterEach(() => db("group_tests").del());

    afterAll(async () => {
      await db("groups").where({ id: "group2Id" }).del();
      return db("tests").whereIn("id", ["test2Id", "test3Id", "test4Id"]).del();
    });

    it("creates group tests for a group", async () => {
      const result = await createGroupTestsForGroup(
        { group_id: "group2Id", test_ids: ["test2Id", "test3Id"] },
        { logger }
      );

      expect(result).toHaveLength(2);

      const groupTests = await db
        .select("*")
        .from("group_tests")
        .orderBy("test_id", "asc");
      expect(groupTests).toMatchObject([
        { group_id: "group2Id", test_id: "test2Id" },
        { group_id: "group2Id", test_id: "test3Id" },
      ]);
    });

    it("handles pre-existing group tests", async () => {
      await db("group_tests").insert({
        group_id: "group2Id",
        id: "groupTestId",
        test_id: "test2Id",
      });

      const result = await createGroupTestsForGroup(
        { group_id: "group2Id", test_ids: ["test2Id", "test3Id"] },
        { logger }
      );

      expect(result).toHaveLength(1);

      const groupTests = await db
        .select("*")
        .from("group_tests")
        .orderBy("test_id", "asc");
      expect(groupTests).toMatchObject([
        { group_id: "group2Id", test_id: "test2Id" },
        { group_id: "group2Id", test_id: "test3Id" },
      ]);
    });
  });

  describe("deleteGroupTestsForGroup", () => {
    beforeAll(async () => {
      await db("groups").insert([buildGroup({ i: 2 }), buildGroup({ i: 3 })]);
      return db("tests").insert([buildTest({ i: 2 }), buildTest({ i: 3 })]);
    });

    beforeEach(async () => {
      return db("group_tests").insert([
        { group_id: "groupId", id: "groupTestId", test_id: "test2Id" },
        { group_id: "group2Id", id: "groupTest2Id", test_id: "test2Id" },
        { group_id: "group2Id", id: "groupTest3Id", test_id: "test3Id" },
      ]);
    });

    afterEach(() => db("group_tests").del());

    afterAll(async () => {
      await db("groups").whereIn("id", ["group2Id", "group3Id"]).del();
      return db("tests").whereIn("id", ["test2Id", "test3Id"]).del();
    });

    it("deletes group tests for specified group", async () => {
      const deleteCount = await deleteGroupTestsForGroup(
        { group_id: "group2Id" },
        { logger }
      );
      expect(deleteCount).toBe(2);

      const groupTests = await db.select("*").from("group_tests");

      expect(groupTests).toMatchObject([{ id: "groupTestId" }]);
    });

    it("deletes group tests for specified group and test ids", async () => {
      const deleteCount = await deleteGroupTestsForGroup(
        { group_id: "group2Id", test_ids: ["test3Id"] },
        { logger }
      );
      expect(deleteCount).toBe(1);

      const groupTests = await db.select("*").from("group_tests");

      expect(groupTests).toMatchObject([
        { id: "groupTestId" },
        { id: "groupTest2Id" },
      ]);
    });
  });

  describe("deleteGroupTestsForTests", () => {
    beforeAll(async () => {
      await db("groups").insert(buildGroup({ i: 2 }));

      await db("tests").insert([
        buildTest({ i: 2 }),
        buildTest({ i: 3 }),
        buildTest({ i: 4 }),
      ]);

      return db("group_tests").insert([
        { group_id: "groupId", id: "groupTestId", test_id: "test2Id" },
        { group_id: "group2Id", id: "groupTest2Id", test_id: "test2Id" },
        { group_id: "groupId", id: "groupTest3Id", test_id: "test3Id" },
        { group_id: "groupId", id: "groupTest4Id", test_id: "testId" },
      ]);
    });

    afterAll(async () => {
      await db("group_tests").del();
      await db("groups").where({ id: "group2Id" }).del();

      return db("tests").whereIn("id", ["test2Id", "test3Id", "test4Id"]).del();
    });

    it("deletes group tests for specified tests", async () => {
      await deleteGroupTestsForTests(["test2Id", "test3Id"], { logger });

      const groupTests = await db.select("*").from("group_tests");

      expect(groupTests).toMatchObject([{ id: "groupTest4Id" }]);
    });
  });
});
