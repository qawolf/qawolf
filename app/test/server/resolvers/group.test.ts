import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createGroupResolver,
  deleteGroupResolver,
  groupsResolver,
  testGroupsResolver,
  updateGroupResolver,
} from "../../../server/resolvers/group";
import {
  buildGroup,
  buildIntegration,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

afterAll(() => dropTestDb());

const testContext = {
  api_key: null,
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

describe("createGroupResolver", () => {
  afterAll(() => db("groups").del());

  it("creates a new group", async () => {
    const group = await createGroupResolver(
      {},
      { team_id: "teamId" },
      testContext
    );

    expect(group).toMatchObject({
      creator_id: "userId",
      name: "My Tests",
      repeat_minutes: null,
      team_id: "teamId",
    });
  });
});

describe("deleteGroupResolver", () => {
  beforeAll(async () => {
    await db("groups").insert([
      buildGroup({}),
      buildGroup({ i: 2, is_default: true }),
    ]);
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);

    return db("group_tests").insert([
      { group_id: "groupId", id: "groupTestId", test_id: "testId" },
      { group_id: "groupId", id: "groupTest2Id", test_id: "test2Id" },
      { group_id: "group2Id", id: "groupTest3Id", test_id: "testId" },
    ]);
  });

  afterAll(async () => {
    await db("group_tests").del();
    await db("groups").del();
    return db("tests").del();
  });

  it("deletes a group and associated group tests", async () => {
    const result = await deleteGroupResolver(
      {},
      { id: "groupId" },
      testContext
    );

    expect(result).toEqual({
      default_group_id: "group2Id",
      id: "groupId",
    });

    const group = await db
      .select("*")
      .from("groups")
      .where({ id: "groupId" })
      .first();
    expect(group.deleted_at).toBeTruthy();

    const groupTests = await db.select("*").from("group_tests");
    expect(groupTests).toMatchObject([{ id: "groupTest3Id" }]);
  });
});

describe("groupsResolver", () => {
  beforeAll(() => {
    return db("groups").insert([
      buildGroup({}),
      buildGroup({ i: 2 }),
      buildGroup({ i: 3, team_id: "team2Id" }),
    ]);
  });

  afterAll(() => db("groups").del());

  it("returns groups for a team", async () => {
    const groups = await groupsResolver({}, { team_id: "teamId" }, testContext);

    expect(groups).toMatchObject([{ id: "groupId" }, { id: "group2Id" }]);
  });
});

describe("testGroupsResolver", () => {
  beforeAll(async () => {
    await db("groups").insert([
      buildGroup({ name: "A Group" }),
      buildGroup({ i: 2, is_default: true, name: "All Tests" }),
      buildGroup({ i: 3 }),
    ]);
    await db("tests").insert(buildTest({}));
    return db("group_tests").insert([
      { group_id: "groupId", id: "groupTestId", test_id: "testId" },
      { group_id: "group2Id", id: "groupTest2Id", test_id: "testId" },
    ]);
  });

  afterAll(async () => {
    await db("group_tests").del();
    await db("groups").del();
    return db("tests").del();
  });

  it("finds groups for a test", async () => {
    const groups = await testGroupsResolver(buildTest({}), {}, testContext);

    expect(groups).toMatchObject([
      {
        name: "A Group",
      },
      { name: "All Tests" },
    ]);
  });
});

describe("updateGroupResolver", () => {
  beforeAll(async () => {
    await db("integrations").insert([
      buildIntegration({}),
      buildIntegration({ i: 2, type: "github" }),
    ]);
    await db("groups").insert(buildGroup({}));
  });

  afterAll(() => db("groups").del());

  it("updates a group", async () => {
    const updatedGroup = await updateGroupResolver(
      {},
      { id: "groupId", name: "newName", repeat_minutes: 24 * 60 },
      testContext
    );

    expect(updatedGroup.name).toBe("newName");
    expect(updatedGroup.repeat_minutes).toBe(24 * 60);
  });

  it("updates alert preferences for group", async () => {
    const updatedGroup = await updateGroupResolver(
      {},
      {
        id: "groupId",
        is_email_enabled: false,
        alert_integration_id: "integrationId",
      },
      testContext
    );

    expect(updatedGroup).toMatchObject({
      is_email_enabled: false,
      alert_integration_id: "integrationId",
    });
  });

  it("updates deployment preferences for group", async () => {
    const updatedGroup = await updateGroupResolver(
      {},
      {
        deployment_branches: "main",
        deployment_environment: "preview",
        deployment_integration_id: "integration2Id",
        id: "groupId",
        repeat_minutes: null,
      },
      testContext
    );

    expect(updatedGroup).toMatchObject({
      deployment_branches: "main",
      deployment_environment: "preview",
      deployment_integration_id: "integration2Id",
      repeat_minutes: null,
    });
  });
});
