import { createGroup } from "../../../server/models/group";
import { Group } from "../../../server/types";
import { prepareTestDb } from "../db";

import { buildGroup, buildTeam, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(() => {
  return db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

describe("group model", () => {
  afterEach(() => db("groups").del());

  describe("createGroup", () => {
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
});
