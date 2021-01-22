import { db, dropTestDb, migrateDb } from "../../../server/db";
import { decrypt } from "../../../server/models/encrypt";
import * as environmentVariableModel from "../../../server/models/environment_variable";
import { EnvironmentVariable } from "../../../server/types";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildTeam,
  buildUser,
  logger,
} from "../utils";

const {
  buildEnvironmentVariables,
  createEnvironmentVariable,
  deleteEnvironmentVariable,
  findEnvironmentVariable,
  findEnvironmentVariablesForEnvironment,
  findSystemEnvironmentVariable,
} = environmentVariableModel;

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

describe("buildEnvironmentVariablesForGroup", () => {
  beforeAll(async () => {
    await db("environments").insert(buildEnvironment({ i: 3, name: "Other" }));

    return db("environment_variables").insert([
      buildEnvironmentVariable({
        environment_id: "environmentId",
        name: "EMAIL",
        value: "staging@qawolf.com",
      }),
      buildEnvironmentVariable({
        environment_id: "environmentId",
        i: 2,
        name: "NODE_ENV",
        value: "staging",
      }),
      buildEnvironmentVariable({
        environment_id: "environmentId",
        i: 3,
        name: "PASSWORD",
        value: "staging_password",
      }),
      buildEnvironmentVariable({
        environment_id: "environment2Id",
        i: 4,
        name: "LOGIN_CODE",
        value: "production_login_code",
      }),
      buildEnvironmentVariable({
        environment_id: "environment2Id",
        i: 5,
        name: "PASSWORD",
        value: "production_password",
      }),
    ]);
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await db("environment_variables").del();

    return db("environments").where({ id: "environment3Id" }).del();
  });

  it("builds environment variables for an environment", async () => {
    const variables = await buildEnvironmentVariables(
      { environment_id: "environment2Id", team_id: "teamId" },
      { logger }
    );

    expect(variables).toBe(
      JSON.stringify({
        LOGIN_CODE: "production_login_code",
        PASSWORD: "production_password",
      })
    );
  });

  it("includes custom variables", async () => {
    const variables = await buildEnvironmentVariables(
      {
        custom_variables: {
          CUSTOM_VARIABLE: "custom_value",
          EMAIL: "custom@qawolf.com",
        },
        environment_id: "environmentId",
        team_id: "teamId",
      },
      { logger }
    );

    expect(variables).toBe(
      JSON.stringify({
        EMAIL: "custom@qawolf.com",
        NODE_ENV: "staging",
        PASSWORD: "staging_password",
        CUSTOM_VARIABLE: "custom_value",
      })
    );
  });

  it("returns empty object if no environment variables for environment", async () => {
    const variables = await buildEnvironmentVariables(
      { environment_id: "environment3Id", team_id: "team2Id" },
      { logger }
    );

    expect(variables).toBe("{}");
  });
});

describe("createEnvironmentVariable", () => {
  afterEach(() => db("environment_variables").del());

  it("creates an environment variable", async () => {
    await createEnvironmentVariable(
      {
        environment_id: "environmentId",
        name: "my Secret",
        team_id: "teamId",
        value: "spirit",
      },
      { logger }
    );

    const environmentVariable = await db("environment_variables")
      .select("*")
      .first();

    expect(environmentVariable).toMatchObject({
      environment_id: "environmentId",
      is_system: false,
      name: "MY_SECRET",
      team_id: "teamId",
    });

    expect(environmentVariable.value).not.toBe("spirit");
    expect(decrypt(environmentVariable.value)).toBe("spirit");
  });

  it("does not create an environment variable if name taken for environment", async () => {
    await createEnvironmentVariable(
      {
        environment_id: "environmentId",
        name: "my_Secret",
        team_id: "teamId",
        value: "spirit",
      },
      { logger }
    );

    const testFn = async (): Promise<EnvironmentVariable> => {
      return createEnvironmentVariable(
        {
          environment_id: "environmentId",
          name: "MY_SECRET",
          team_id: "teamId",
          value: "spirit",
        },
        { logger }
      );
    };

    await expect(testFn()).rejects.toThrowError("variable name must be unique");
  });
});

describe("deleteEnvironmentVariable", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({}),
      buildEnvironmentVariable({ i: 2 }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("deletes an environment variable", async () => {
    await deleteEnvironmentVariable("environmentVariableId", { logger });
    const environmentVariables = await db("environment_variables").select("*");

    expect(environmentVariables).toMatchObject([
      { id: "environmentVariable2Id" },
    ]);
  });
});

describe("findEnvironmentVariable", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({}),
      buildEnvironmentVariable({ i: 2 }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("finds an environment variable", async () => {
    const environmentVariable = await findEnvironmentVariable(
      "environmentVariableId",
      { logger }
    );

    expect(environmentVariable).toMatchObject({ id: "environmentVariableId" });
  });

  it("throws an error if environment variable not found", async () => {
    const testFn = async (): Promise<EnvironmentVariable> => {
      return findEnvironmentVariable("fakeId", { logger });
    };

    await expect(testFn()).rejects.toThrowError("not found");
  });
});

describe("findEnvironmentVariablesForEnvironment", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({ name: "B_VAR" }),
      buildEnvironmentVariable({ i: 2, name: "A_VAR" }),
      buildEnvironmentVariable({ i: 3, environment_id: "environment2Id" }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("finds environment variables for a group", async () => {
    const environmentVariables = await findEnvironmentVariablesForEnvironment(
      "environmentId",
      { logger }
    );

    expect(environmentVariables).toMatchObject([
      { id: "environmentVariable2Id", name: "A_VAR" },
      { id: "environmentVariableId", name: "B_VAR" },
    ]);
  });
});

describe("findSystemEnvironmentVariable", () => {
  beforeAll(() => {
    return db("environment_variables").insert({
      ...buildEnvironmentVariable({ name: "SYSTEM_ENV" }),
      is_system: true,
    });
  });

  afterAll(() => db("environment_variables").del());

  it("finds a system environment variable", async () => {
    const environmentVariable = await findSystemEnvironmentVariable(
      "SYSTEM_ENV"
    );

    expect(environmentVariable).toMatchObject({
      is_system: true,
      name: "SYSTEM_ENV",
    });
  });

  it("throws an error if environment variable not found", async () => {
    const testFn = async (): Promise<EnvironmentVariable> => {
      return findSystemEnvironmentVariable("FAKE_NAME");
    };

    await expect(testFn()).rejects.toThrowError("not found");
  });
});
