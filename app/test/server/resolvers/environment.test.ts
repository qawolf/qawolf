import {
  createEnvironmentResolver,
  deleteEnvironmentResolver,
  environmentsResolver,
  updateEnvironmentResolver,
} from "../../../server/resolvers/environment";
import { prepareTestDb } from "../db";
import { buildEnvironment, buildTeam, buildUser, testContext } from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));

  return db("environments").insert([
    buildEnvironment({}),
    buildEnvironment({ i: 2, name: "Production" }),
  ]);
});

describe("createEnvironmentResolver", () => {
  it("creates an environment", async () => {
    const environment = await createEnvironmentResolver(
      {},
      { name: "New Environment", team_id: "teamId" },
      context
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
      context
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
      context
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
      context
    );

    expect(environment).toMatchObject({
      id: "environmentId",
      name: "New Name",
    });
  });
});
