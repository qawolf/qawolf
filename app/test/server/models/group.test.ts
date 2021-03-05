import {
  createGroup,
  deleteGroup,
  findGroup,
  findGroupsForTeam,
  updateGroup,
} from "../../../server/models/group";
import { Group } from "../../../server/types";
import { prepareTestDb } from "../db";
import { buildGroup, buildTeam, buildTest, buildUser, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);

  return db("tests").insert(buildTest({}));
});

describe("group model", () => {
  describe("createGroup", () => {
    afterEach(() => db("groups").del());

    it("creates a new group", async () => {
      const group = await createGroup(
        { name: "Group name", team_id: "teamId" },
        options
      );

      const dbGroup = await db("groups").first();

      expect(group.name).toBe("Group name");
      expect(dbGroup).toMatchObject(group);
    });

    it("throws an error if group name taken", async () => {
      await db("groups").insert(buildGroup({ name: "Taken" }));

      await expect(
        (async (): Promise<Group> => {
          return createGroup({ name: "Taken", team_id: "teamId" }, options);
        })()
      ).rejects.toThrowError("name must be unique");
    });
  });

  describe("deleteGroup", () => {
    beforeEach(() => db("groups").insert(buildGroup({})));

    afterEach(() => db("groups").del());

    it("deletes a group", async () => {
      await db("tests").update({ group_id: "groupId" });

      const group = await deleteGroup("groupId", { db, logger });
      expect(group).toMatchObject({ id: "groupId" });

      const dbGroup = await db("groups").where({ id: "groupId" }).first();
      expect(dbGroup).toBeFalsy();

      const test = await db("tests").first();
      expect(test.group_id).toBeNull();
    });
  });

  describe("findGroup", () => {
    beforeAll(() => db("groups").insert(buildGroup({})));

    afterAll(() => db("groups").del());

    it("finds a group", async () => {
      const group = await findGroup("groupId", { db, logger });

      expect(group).toMatchObject({ id: "groupId" });
    });

    it("throws an error if group not found", async () => {
      await expect(
        (async () => {
          return findGroup("fakeId", { db, logger });
        })()
      ).rejects.toThrowError("not found");
    });
  });

  describe("findGroupsForTeam", () => {
    beforeAll(() => {
      return db("groups").insert([
        buildGroup({ name: "B Group" }),
        buildGroup({ i: 2, name: "A Group" }),
        buildGroup({ i: 3, team_id: "team2Id" }),
      ]);
    });

    afterAll(() => db("groups").del());

    it("finds groups for a team", async () => {
      const groups = await findGroupsForTeam("teamId", options);

      expect(groups).toMatchObject([{ name: "A Group" }, { name: "B Group" }]);
    });
  });

  describe("updateGroup", () => {
    beforeAll(() => {
      return db("groups").insert([
        buildGroup({}),
        buildGroup({ i: 2, name: "Taken" }),
      ]);
    });

    afterAll(() => db("groups").del());

    it("updates a group name", async () => {
      const group = await updateGroup(
        { id: "groupId", name: "New name" },
        options
      );

      const dbGroup = await db("groups").where({ id: "groupId" }).first();

      expect(group.name).toBe("New name");
      expect(dbGroup).toMatchObject({
        ...group,
        updated_at: new Date(group.updated_at),
      });
    });

    it("throws an error if group name taken", async () => {
      await expect(
        (async (): Promise<Group> => {
          return updateGroup({ id: "groupId", name: "Taken" }, options);
        })()
      ).rejects.toThrowError("name must be unique");
    });
  });
});
