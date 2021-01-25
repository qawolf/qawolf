import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as groupModel from "../../../server/models/group";
import { Group } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import {
  buildGroup,
  buildIntegration,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const {
  buildGroupName,
  createGroup,
  deleteGroup,
  findDefaultGroupForTeam,
  findGroup,
  findGroupsForGitHubIntegration,
  findGroupsForTeam,
  findGroupsForTest,
  findPendingGroups,
  getNextAt,
  getNextDay,
  getNextHour,
  getUpdatedNextAt,
  updateGroup,
  updateGroupNextAt,
} = groupModel;

const mockDateConstructor = (dateString: string): void => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, "Date").mockImplementation(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockDate as any;
  });
};

beforeAll(async () => {
  await migrateDb();

  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("users").insert(buildUser({}));
  await db("integrations").insert([
    buildIntegration({}),
    buildIntegration({ i: 2, type: "github" }),
  ]);
});

afterAll(() => dropTestDb());

describe("group model", () => {
  afterEach(jest.restoreAllMocks);

  describe("buildGroupName", () => {
    it("returns default name if no groups", async () => {
      jest
        .spyOn(groupModel, "findGroupsForTeam")
        .mockReturnValue(Promise.resolve([]));

      const name = await buildGroupName("teamId", { logger });

      expect(name).toBe("My Tests");
    });

    it("returns incremented name if possible", async () => {
      jest
        .spyOn(groupModel, "findGroupsForTeam")
        .mockReturnValue(Promise.resolve([{ name: "My Tests" }] as Group[]));

      const name = await buildGroupName("teamId", { logger });

      expect(name).toBe("My Tests 2");
    });

    it("keeps incrementing until unique name found", async () => {
      jest
        .spyOn(groupModel, "findGroupsForTeam")
        .mockReturnValue(
          Promise.resolve([
            { name: "My Tests" },
            { name: "My Tests 2" },
          ] as Group[])
        );

      const name = await buildGroupName("teamId", { logger });

      expect(name).toBe("My Tests 3");
    });
  });

  describe("createGroup", () => {
    afterEach(() => db("groups").del());

    it("creates a new group", async () => {
      await createGroup(
        {
          creator_id: "userId",
          name: "Schedule (once an hour)",
          repeat_minutes: 60,
          team_id: "teamId",
        },
        { logger }
      );

      const groups = await db.select("*").from("groups");

      expect(groups).toMatchObject([
        {
          alert_integration_id: null,
          creator_id: "userId",
          deleted_at: null,
          deployment_integration_id: null,
          environment_id: null,
          id: expect.any(String),
          is_default: false,
          is_email_enabled: true,
          name: "Schedule (once an hour)",
          next_at: expect.any(Date),
          repeat_minutes: 60,
          team_id: "teamId",
        },
      ]);
    });

    it("creates a new default group", async () => {
      await createGroup(
        {
          creator_id: "userId",
          is_default: true,
          name: "All Tests",
          repeat_minutes: null,
          team_id: "teamId",
        },
        { logger }
      );

      const groups = await db.select("*").from("groups");

      expect(groups).toMatchObject([
        {
          alert_integration_id: null,
          creator_id: "userId",
          id: expect.any(String),
          is_default: true,
          is_email_enabled: true,
          name: "All Tests",
          next_at: null,
          repeat_minutes: null,
          team_id: "teamId",
        },
      ]);
    });
  });

  describe("deleteGroup", () => {
    beforeAll(async () => {
      return db("groups").insert([
        buildGroup({}),
        buildGroup({ i: 2, is_default: true }),
      ]);
    });

    afterAll(() => db("groups").del());

    it("deletes a group", async () => {
      const group = await deleteGroup("groupId", { logger });

      expect(group).toMatchObject({
        deleted_at: expect.any(String),
        id: "groupId",
        is_default: false,
      });

      const dbGroup = await db
        .select("*")
        .from("groups")
        .where({ id: "groupId" })
        .first();
      expect(dbGroup.deleted_at).toBeTruthy();
    });

    it("throws an error if group is default", async () => {
      const testFn = async (): Promise<Group> => {
        return deleteGroup("group2Id", { logger });
      };

      await expect(testFn()).rejects.toThrowError("cannot delete");
    });
  });

  describe("findDefaultGroupForTeam", () => {
    beforeAll(async () => {
      await db("teams").insert(buildTeam({ i: 3 }));
      return db("groups").insert([
        buildGroup({ is_default: true, name: "All Tests", team_id: "team3Id" }),
        buildGroup({ i: 2, is_default: false, team_id: "team3Id" }),
      ]);
    });

    afterAll(async () => {
      await db("groups").del();
      return db("teams").where({ id: "team3Id" }).del();
    });

    it("finds the default group for a team", async () => {
      const group = await findDefaultGroupForTeam("team3Id", { logger });
      expect(group).toMatchObject({ is_default: true, name: "All Tests" });
    });

    it("throws an error if a team has no default group", async () => {
      await db("groups").where({ is_default: true }).del();

      const testFn = async (): Promise<Group> => {
        return findDefaultGroupForTeam("team3Id", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");

      await db("groups").insert(
        buildGroup({ is_default: true, name: "All Tests", team_id: "team3Id" })
      );
    });
  });

  describe("findGroup", () => {
    beforeAll(() => db("groups").insert(buildGroup({})));

    afterAll(() => db("groups").del());

    it("finds a group", async () => {
      const group = await findGroup("groupId", { logger });

      expect(group).toMatchObject({ id: "groupId" });
    });

    it("throws an error if group does not exist", async () => {
      const testFn = async (): Promise<Group> => {
        return findGroup("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });

    it("throws an error if group is deleted", async () => {
      await db("groups").update({ deleted_at: minutesFromNow() });

      const testFn = async (): Promise<Group> => {
        return findGroup("groupId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");

      await db("groups").update({ deleted_at: null });
    });
  });

  describe("findGroupsForGitHubIntegration", () => {
    beforeAll(async () => {
      await db("integrations").insert([
        buildIntegration({
          github_installation_id: 123,
          github_repo_id: 1,
          i: 3,
          type: "github",
        }),
        buildIntegration({
          github_installation_id: 123,
          github_repo_id: 2,
          i: 4,
          type: "github",
        }),
      ]);

      await db("groups").insert([
        buildGroup({ deployment_integration_id: "integration3Id" }),
        buildGroup({ deployment_integration_id: "integration3Id", i: 2 }),
        buildGroup({ deployment_integration_id: "integration4Id", i: 3 }),
        buildGroup({ deployment_integration_id: null, i: 4 }),
      ]);

      return db("groups")
        .where({ id: "group2Id" })
        .update({ deleted_at: new Date().toISOString() });
    });

    afterAll(async () => {
      await db("groups").del();

      return db("integrations")
        .whereIn("id", ["integration3Id", "integration4Id"])
        .del();
    });

    it("returns groups for a github integration", async () => {
      const groups = await findGroupsForGitHubIntegration(1, { logger });

      expect(groups).toMatchObject([
        { deployment_integration_id: "integration3Id", id: "groupId" },
      ]);
    });
  });

  describe("findGroupsForTeam", () => {
    beforeAll(() => {
      return db("groups").insert([
        buildGroup({ name: "A Group" }),
        {
          ...buildGroup({ name: "deleted" }),
          deleted_at: minutesFromNow(),
          id: "deletedGroupId",
        },
        buildGroup({ i: 2, is_default: true, name: "All Tests" }),
        buildGroup({ i: 3, team_id: "team2Id" }),
        buildGroup({ i: 4, name: "B Group" }),
      ]);
    });

    afterAll(() => db("groups").del());

    it("returns groups for a team", async () => {
      const groups = await findGroupsForTeam("teamId", { logger });

      expect(groups).toMatchObject([
        { id: "group2Id", name: "All Tests" },
        { id: "groupId", name: "A Group" },
        { id: "group4Id", name: "B Group" },
      ]);
    });
  });

  describe("findGroupsForTest", () => {
    beforeAll(async () => {
      await db("groups").insert([
        buildGroup({ name: "A Group" }),
        buildGroup({ i: 2, is_default: true, name: "All Tests" }),
        buildGroup({ i: 3 }),
        {
          ...buildGroup({}),
          deleted_at: minutesFromNow(),
          id: "deletedGroupId",
        },
      ]);
      await db("tests").insert(buildTest({}));
      return db("group_tests").insert([
        { group_id: "groupId", id: "groupTestId", test_id: "testId" },
        { group_id: "group2Id", id: "groupTest2Id", test_id: "testId" },
        { group_id: "deletedGroupId", id: "groupTest3Id", test_id: "testId" },
      ]);
    });

    afterAll(async () => {
      await db("group_tests").del();
      await db("groups").del();
      return db("tests").del();
    });

    it("finds groups for a test", async () => {
      const groups = await findGroupsForTest("testId", { logger });

      expect(groups).toMatchObject([
        {
          name: "A Group",
        },
        { name: "All Tests" },
      ]);
    });
  });

  describe("findPendingGroups", () => {
    beforeAll(async () => {
      await db("teams").where({ id: "team2Id" }).update({ is_enabled: false });

      return db("groups").insert([
        buildGroup({ next_at: new Date("2020-01-01").toISOString() }),
        buildGroup({ i: 2, next_at: new Date("2100-01-01").toISOString() }),
        buildGroup({ i: 3, next_at: null }),
        buildGroup({ i: 4, next_at: new Date("2019-01-01").toISOString() }),
        {
          ...buildGroup({
            i: 5,
            next_at: new Date("2019-01-01").toISOString(),
          }),
          deleted_at: minutesFromNow(),
        },
        buildGroup({
          i: 6,
          next_at: new Date("2019-01-01").toISOString(),
          team_id: "team2Id",
        }),
        buildGroup({
          i: 7,
          next_at: new Date("2020-01-01").toISOString(),
          team_id: "team2Id",
        }),
      ]);
    });

    afterAll(async () => {
      await db("teams").where({ id: "team2Id" }).update({ is_enabled: true });

      return db("groups").del();
    });

    it("returns pending groups", async () => {
      const groups = await findPendingGroups({ logger });

      expect(groups).toMatchObject([{ id: "group4Id" }, { id: "groupId" }]);
    });
  });

  describe("getNextAt", () => {
    it("returns null if no repeat_minutes", () => {
      expect(getNextAt(null)).toBeNull();
    });

    it("returns next hour if applicable", () => {
      mockDateConstructor("2020-06-23T14:04:53.643Z");
      expect(getNextAt(60)).toBe("2020-06-23T15:00:00.000Z");
    });

    it("returns next day if applicable", () => {
      mockDateConstructor("2020-06-23T16:04:53.643Z");
      expect(getNextAt(24 * 60)).toBe("2020-06-24T16:00:00.000Z");
    });

    it("throws an error if unsupported interval", () => {
      const testFn = (): string | null => getNextAt(160);
      expect(testFn).toThrowError("Cannot get next_at");
    });
  });

  describe("getNextDay", () => {
    it("returns the next day if daily run time has passed", () => {
      mockDateConstructor("2020-06-23T20:04:53.643Z");
      expect(getNextDay()).toBe("2020-06-24T16:00:00.000Z");
    });

    it("returns the current day otherwise", () => {
      mockDateConstructor("2020-06-23T01:04:53.643Z");
      expect(getNextDay()).toBe("2020-06-23T16:00:00.000Z");
    });
  });

  describe("getNextHour", () => {
    it("returns the next hour mark", () => {
      mockDateConstructor("2020-06-23T20:04:53.643Z");
      expect(getNextHour()).toBe("2020-06-23T21:00:00.000Z");
    });

    it("handles changing days", () => {
      mockDateConstructor("2020-06-23T23:04:53.643Z");
      expect(getNextHour()).toBe("2020-06-24T00:00:00.000Z");
    });
  });

  describe("getUpdatedNextAt", () => {
    it("returns null if no next_at or repeat_minutes", () => {
      expect(getUpdatedNextAt({ next_at: null } as Group)).toBeNull();
      expect(
        getUpdatedNextAt({
          next_at: minutesFromNow(),
          repeat_minutes: null,
        } as Group)
      ).toBeNull();
    });

    it("increments next_at by repeat_minutes", () => {
      expect(
        getUpdatedNextAt({
          next_at: "2050-06-24T01:00:00.000Z",
          repeat_minutes: 60,
        } as Group)
      ).toBe("2050-06-24T02:00:00.000Z");
    });

    it("resets next_at if applicable", () => {
      const next_at = getUpdatedNextAt({
        next_at: "2019-06-24T01:00:00.000Z",
        repeat_minutes: 60,
      } as Group);

      expect(new Date(next_at as string).getFullYear()).toBe(
        new Date().getFullYear()
      );
    });
  });

  describe("updateGroup", () => {
    beforeEach(() => {
      return db("groups").insert(buildGroup({}));
    });

    afterEach(() => db("groups").del());

    it("updates a group", async () => {
      const oldGroup = await db.select("*").from("groups").first();

      await updateGroup(
        {
          alert_integration_id: "integrationId",
          deployment_integration_id: "integration2Id",
          id: "groupId",
          is_email_enabled: false,
          name: "newName",
        },
        { logger }
      );
      const updatedGroup = await db.select("*").from("groups").first();

      expect(updatedGroup.alert_integration_id).toBe("integrationId");
      expect(updatedGroup.deployment_integration_id).toBe("integration2Id");
      expect(updatedGroup.is_email_enabled).toBe(false);
      expect(updatedGroup.name).toBe("newName");
      expect(oldGroup.repeat_minutes).toBe(updatedGroup.repeat_minutes);
      expect(oldGroup.updated_at).not.toBe(updatedGroup.updated_at);

      await updateGroup(
        { alert_integration_id: null, id: "groupId" },
        { logger }
      );
      const updatedGroup2 = await db.select("*").from("groups").first();

      expect(updatedGroup2.alert_integration_id).toBeNull();
    });

    it("updates group deployment settings", async () => {
      await updateGroup(
        {
          deployment_branches: "main, develop",

          deployment_integration_id: "integration2Id",
          id: "groupId",
        },
        { logger }
      );
      const updatedGroup = await db.select("*").from("groups").first();

      expect(updatedGroup.deployment_branches).toBe("main,develop");
      expect(updatedGroup.deployment_environment).toBeNull();

      await updateGroup(
        {
          deployment_branches: null,
          deployment_environment: "preview",
          deployment_integration_id: "integration2Id",
          id: "groupId",
        },
        { logger }
      );
      const updatedGroup2 = await db.select("*").from("groups").first();

      expect(updatedGroup2.deployment_branches).toBeNull();
      expect(updatedGroup2.deployment_environment).toBe("preview");
    });

    it("updates repeat_minutes", async () => {
      const oldGroup = await db.select("*").from("groups").first();

      await updateGroup({ id: "groupId", repeat_minutes: 24 * 60 }, { logger });

      const updatedGroup = await db.select("*").from("groups").first();

      expect(updatedGroup.repeat_minutes).toBe(24 * 60);
      expect(updatedGroup.next_at).not.toBe(oldGroup.next_at);
    });

    it("clears repeat_minutes", async () => {
      await updateGroup({ id: "groupId", repeat_minutes: null }, { logger });

      const updatedGroup = await db.select("*").from("groups").first();

      expect(updatedGroup.repeat_minutes).toBeNull();
      expect(updatedGroup.next_at).toBeNull();
    });

    it("throws an error if group name exists", async () => {
      const oldGroup = await db.select("*").from("groups").first();

      await db("groups").insert(buildGroup({ i: 2 }));

      const testFn = async (): Promise<Group> =>
        updateGroup({ id: "group2Id", name: oldGroup.name }, { logger });

      await expect(testFn()).rejects.toThrowError("group name must be unique");

      await db("groups").where({ id: "group2Id" }).del();
    });

    it("throws an error if group id invalid", async () => {
      const testFn = async (): Promise<Group> => {
        return updateGroup({ id: "fakeId", name: "name" }, { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });

    it("throws an error if trying to rename default group", async () => {
      await db("groups").where({ id: "groupId" }).update({ is_default: true });

      const testFn = async (): Promise<Group> => {
        return updateGroup({ id: "groupId", name: "newName" }, { logger });
      };

      await expect(testFn()).rejects.toThrowError("default group");

      await db("groups").where({ id: "groupId" }).update({ is_default: false });
    });
  });

  describe("updateGroupNextAt", () => {
    beforeAll(() => {
      return db("groups").insert(
        buildGroup({
          next_at: new Date("2050-06-24T00:00:00.000Z").toISOString(),
        })
      );
    });

    afterAll(() => db("groups").del());

    it("updates next_at timestamp of a group", async () => {
      const updateGroup = await db.transaction(async (trx) => {
        const group = await trx.select("*").from("groups").first();
        await updateGroupNextAt(group, { logger, trx });

        return trx.select("*").from("groups").first();
      });

      expect(updateGroup).toMatchObject({
        id: "groupId",
        next_at: new Date("2050-06-24T01:00:00.000Z"),
      });
    });
  });
});
