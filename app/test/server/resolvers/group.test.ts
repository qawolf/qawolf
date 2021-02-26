import {
  createGroupResolver,
  deleteGroupResolver,
  groupsResolver,
  updateGroupResolver,
} from "../../../server/resolvers/group";
import { prepareTestDb } from "../db";
import {
  buildGroup,
  buildTeam,
  buildTeamUser,
  buildUser,
  testContext,
} from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

beforeAll(async () => {
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("users").insert(buildUser({}));
  return db("team_users").insert(buildTeamUser({}));
});

describe("createGroupResolver", () => {
  afterAll(() => db("groups").del());

  it("creates a new group", async () => {
    const group = await createGroupResolver(
      {},
      { name: "New group", team_id: "teamId" },
      context
    );

    expect(group).toMatchObject({ name: "New group", team_id: "teamId" });
  });
});

describe("deleteGroupResolver", () => {
  beforeAll(() => db("groups").insert(buildGroup({})));

  afterAll(() => db("groups").del());

  it("deletes a group", async () => {
    const group = await deleteGroupResolver({}, { id: "groupId" }, context);

    expect(group).toMatchObject({ id: "groupId" });

    const groups = await db("groups");

    expect(groups).toEqual([]);
  });
});

describe("groupsResolver", () => {
  beforeAll(() =>
    db("groups").insert([
      buildGroup({}),
      buildGroup({ i: 2, team_id: "team2Id" }),
    ])
  );

  afterAll(() => db("groups").del());

  it("finds groups for a team", async () => {
    const groups = await groupsResolver({}, { team_id: "teamId" }, context);

    expect(groups).toMatchObject([{ id: "groupId" }]);
  });
});

describe("updateGroupResolver", () => {
  beforeAll(() => db("groups").insert(buildGroup({})));

  afterAll(() => db("groups").del());

  it("updates a group", async () => {
    const group = await updateGroupResolver(
      {},
      { id: "groupId", name: "New name" },
      context
    );

    expect(group).toMatchObject({ id: "groupId", name: "New name" });
  });
});
