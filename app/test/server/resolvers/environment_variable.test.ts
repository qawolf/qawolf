import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createEnvironmentVariableResolver,
  deleteEnvironmentVariableResolver,
  environmentVariablesResolver,
} from "../../../server/resolvers/environment_variable";
import { EnvironmentVariable } from "../../../server/types";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildTeam,
  buildUser,
  logger,
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

const testContext = {
  api_key: null,
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

describe("createEnvironmentVariableResolver", () => {
  afterEach(() => db("environment_variables").del());

  it("creates an environment variable", async () => {
    const environmentVariable = await createEnvironmentVariableResolver(
      {},
      { environment_id: "environmentId", name: "my_VARIABLE", value: "secret" },
      testContext
    );

    expect(environmentVariable).toMatchObject({
      environment_id: "environmentId",
      name: "MY_VARIABLE",
      team_id: "teamId",
    });
    expect(environmentVariable.value).not.toBe("secret");
  });
});

describe("deleteEnvironmentVariableResolver", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({}),
      buildEnvironmentVariable({ i: 2 }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("deletes an environment variable", async () => {
    const environmentVariable = await deleteEnvironmentVariableResolver(
      {},
      { id: "environmentVariableId" },
      testContext
    );

    expect(environmentVariable).toMatchObject({ id: "environmentVariableId" });

    const environmentVariables = await db("environment_variables").select("*");

    expect(environmentVariables).toMatchObject([
      { id: "environmentVariable2Id" },
    ]);
  });

  it("throws an error if cannot access environment", async () => {
    const testFn = async (): Promise<EnvironmentVariable> => {
      return deleteEnvironmentVariableResolver(
        {},
        { id: "environmentVariable2Id" },
        { ...testContext, teams: [{ ...buildTeam({ i: 2 }) }] }
      );
    };

    await expect(testFn()).rejects.toThrowError("cannot access environment");
  });
});

describe("environmentVariablesResolver", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({ name: "B_VAR" }),
      buildEnvironmentVariable({ i: 2, name: "A_VAR", value: "anotherSecret" }),
      buildEnvironmentVariable({ environment_id: "environment2Id", i: 3 }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("finds environment variables for an environment", async () => {
    const environmentVariables = await environmentVariablesResolver(
      {},
      { environment_id: "environmentId" },
      testContext
    );

    expect(environmentVariables).toMatchObject({
      env: JSON.stringify({ A_VAR: "anotherSecret", B_VAR: "secret" }),
      variables: [
        { id: "environmentVariable2Id", name: "A_VAR" },
        { id: "environmentVariableId", name: "B_VAR" },
      ],
    });
  });
});
