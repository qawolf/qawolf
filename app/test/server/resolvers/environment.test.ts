import { db, dropTestDb, migrateDb } from "../../../server/db";
import { updateEnvironment } from "../../../server/models/environment";
import {
  createEnvironmentResolver,
  deleteEnvironmentResolver,
  environmentsResolver,
  updateEnvironmentResolver,
} from "../../../server/resolvers/environment";
import {
  buildEnvironment,
  buildTeam,
  buildUser,
  logger,
  testContext,
} from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));

  return db("environments").insert([
    buildEnvironment({}),
    buildEnvironment({ i: 2, name: "Production" }),
  ]);
});

afterAll(() => dropTestDb());

describe("createEnvironmentResolver", () => {
  it("creates an environment", async () => {
    const environment = await createEnvironmentResolver(
      {},
      { name: "New Environment", team_id: "teamId" },
      testContext
    );

    expect(environment).toMatchObject({
      name: "New Environment",
      team_id: "teamId",
    });

    await db("environments").where({ name: "New Environment" }).del();
  });
});

describe("deleteEnvironmentResolver", () => {
  it("deletes an environment", async () => {
    const environment = await deleteEnvironmentResolver(
      {},
      { id: "environmentId" },
      testContext
    );

    expect(environment.id).toBe("environmentId");

    await db("environments").insert(buildEnvironment({}));
  });
});

describe("environmentsResolver", () => {
  it("returns environments for a team", async () => {
    const environments = await environmentsResolver(
      {},
      { team_id: "teamId" },
      testContext
    );

    expect(environments).toMatchObject([
      { name: "Production" },
      { name: "Staging" },
    ]);
  });
});

describe("updateEnvironmentResolver", () => {
  it("updates an environment", async () => {
    const environment = await updateEnvironmentResolver(
      {},
      { id: "environmentId", name: "New Name" },
      testContext
    );

    expect(environment).toMatchObject({
      id: "environmentId",
      name: "New Name",
    });

    await updateEnvironment(
      { id: "environmentId", name: "Staging" },
      { logger }
    );
  });
});
