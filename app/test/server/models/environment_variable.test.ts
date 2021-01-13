import { db, dropTestDb, migrateDb } from "../../../server/db";
import { decrypt } from "../../../server/models/encrypt";
import * as environmentVariableModel from "../../../server/models/environment_variable";
import { EnvironmentVariable } from "../../../server/types";
import {
  buildEnvironmentVariable,
  buildGroup,
  buildTeam,
  buildUser,
  logger,
} from "../utils";

const {
  buildEnvironmentVariablesForGroup,
  createEnvironmentVariable,
  deleteEnvironmentVariable,
  findEnvironmentVariable,
  findEnvironmentVariablesForGroup,
  findSystemEnvironmentVariable,
} = environmentVariableModel;

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
  return db("groups").insert([
    buildGroup({ is_default: true }),
    buildGroup({ i: 2 }),
  ]);
});

afterAll(() => dropTestDb());

describe("buildEnvironmentVariablesForGroup", () => {
  beforeAll(async () => {
    await db("teams").insert(buildTeam({ i: 2 }));
    await db("groups").insert(
      buildGroup({ i: 3, is_default: true, team_id: "team2Id" })
    );

    return db("environment_variables").insert([
      buildEnvironmentVariable({
        group_id: "groupId",
        name: "EMAIL",
        value: "default@qawolf.com",
      }),
      buildEnvironmentVariable({
        group_id: "groupId",
        i: 2,
        name: "NODE_ENV",
        value: "default_env",
      }),
      buildEnvironmentVariable({
        group_id: "groupId",
        i: 3,
        name: "PASSWORD",
        value: "default_password",
      }),
      buildEnvironmentVariable({
        group_id: "group2Id",
        i: 4,
        name: "LOGIN_CODE",
        value: "group2_login_code",
      }),
      buildEnvironmentVariable({
        group_id: "group2Id",
        i: 5,
        name: "PASSWORD",
        value: "group2_password",
      }),
    ]);
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await db("environment_variables").del();

    await db("groups").where({ id: "group3Id" }).del();
    return db("teams").where({ id: "team2Id" }).del();
  });

  it("builds environment variables for a non-default group", async () => {
    jest.spyOn(environmentVariableModel, "findEnvironmentVariablesForGroup");

    const variables = await buildEnvironmentVariablesForGroup(
      { group_id: "group2Id", team_id: "teamId" },
      { logger }
    );

    expect(variables).toBe(
      JSON.stringify({
        EMAIL: "default@qawolf.com",
        NODE_ENV: "default_env",
        PASSWORD: "group2_password",
        LOGIN_CODE: "group2_login_code",
      })
    );

    expect(
      environmentVariableModel.findEnvironmentVariablesForGroup
    ).toBeCalledTimes(2);
  });

  it("builds environment variables for a default group", async () => {
    const variables = await buildEnvironmentVariablesForGroup(
      { group_id: "groupId", team_id: "teamId" },
      { logger }
    );

    expect(variables).toBe(
      JSON.stringify({
        EMAIL: "default@qawolf.com",
        NODE_ENV: "default_env",
        PASSWORD: "default_password",
      })
    );
  });

  it("uses passed environment variables for group if possible", async () => {
    jest.spyOn(environmentVariableModel, "findEnvironmentVariablesForGroup");

    const group_variables = await findEnvironmentVariablesForGroup("group2Id", {
      logger,
    });

    const variables = await buildEnvironmentVariablesForGroup(
      { group_id: "group2Id", group_variables, team_id: "teamId" },
      { logger }
    );

    expect(variables).toBe(
      JSON.stringify({
        EMAIL: "default@qawolf.com",
        NODE_ENV: "default_env",
        PASSWORD: "group2_password",
        LOGIN_CODE: "group2_login_code",
      })
    );

    expect(
      environmentVariableModel.findEnvironmentVariablesForGroup
    ).toBeCalledTimes(1);
  });

  it("includes custom variables", async () => {
    const variables = await buildEnvironmentVariablesForGroup(
      {
        custom_variables: {
          CUSTOM_VARIABLE: "custom_value",
          EMAIL: "custom@qawolf.com",
        },
        group_id: "groupId",
        team_id: "teamId",
      },
      { logger }
    );

    expect(variables).toBe(
      JSON.stringify({
        EMAIL: "custom@qawolf.com",
        NODE_ENV: "default_env",
        PASSWORD: "default_password",
        CUSTOM_VARIABLE: "custom_value",
      })
    );
  });

  it("returns empty object if no environment variables for group", async () => {
    const variables = await buildEnvironmentVariablesForGroup(
      { group_id: "group3Id", team_id: "team2Id" },
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
        group_id: "groupId",
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
      group_id: "groupId",
      is_system: false,
      name: "MY_SECRET",
      team_id: "teamId",
    });

    expect(environmentVariable.value).not.toBe("spirit");
    expect(decrypt(environmentVariable.value)).toBe("spirit");
  });

  it("does not create an environment variable if name taken for group", async () => {
    await createEnvironmentVariable(
      {
        group_id: "groupId",
        name: "my_Secret",
        team_id: "teamId",
        value: "spirit",
      },
      { logger }
    );

    const testFn = async (): Promise<EnvironmentVariable> => {
      return createEnvironmentVariable(
        {
          group_id: "groupId",
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

describe("findEnvironmentVariablesForGroup", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({ name: "B_VAR" }),
      buildEnvironmentVariable({ i: 2, name: "A_VAR" }),
      buildEnvironmentVariable({ i: 3, group_id: "group2Id" }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("finds environment variables for a group", async () => {
    const environmentVariables = await findEnvironmentVariablesForGroup(
      "groupId",
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
