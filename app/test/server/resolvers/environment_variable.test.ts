import {
  createEnvironmentVariableResolver,
  deleteEnvironmentVariableResolver,
  environmentVariablesResolver,
  updateEnvironmentVariableResolver,
} from "../../../server/resolvers/environment_variable";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildTeam,
  buildUser,
  testContext,
} from "../utils";

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

describe("createEnvironmentVariableResolver", () => {
  afterEach(() => db("environment_variables").del());

  it("creates an environment variable", async () => {
    const environmentVariable = await createEnvironmentVariableResolver(
      {},
      { environment_id: "environmentId", name: "my_VARIABLE", value: "secret" },
      context
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
      context
    );

    expect(environmentVariable).toMatchObject({ id: "environmentVariableId" });

    const environmentVariables = await db("environment_variables").select("*");

    expect(environmentVariables).toMatchObject([
      { id: "environmentVariable2Id" },
    ]);
  });

  it("throws an error if cannot access environment", async () => {
    await expect(
      deleteEnvironmentVariableResolver(
        {},
        { id: "environmentVariable2Id" },
        { ...context, teams: [{ ...buildTeam({ i: 2 }) }] }
      )
    ).rejects.toThrowError("cannot access environment");
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
      context
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

describe("updateEnvironmentVariableResolver", () => {
  beforeAll(() => {
    return db("environment_variables").insert(
      buildEnvironmentVariable({ name: "A_VAR" })
    );
  });

  afterAll(() => db("environment_variables").del());

  it("updates an environment variable", async () => {
    const environmentVariable = await updateEnvironmentVariableResolver(
      {},
      { id: "environmentVariableId", name: "NEW_NAME", value: "newValue" },
      context
    );

    expect(environmentVariable).toMatchObject({
      name: "NEW_NAME",
      value: "newValue",
    });
  });
});
