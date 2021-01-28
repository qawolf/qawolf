import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createDefaultEnvironments,
  createEnvironment,
  deleteEnvironment,
  findEnvironmentsForTeam,
  findEnvrionment,
  updateEnvironment,
} from "../../../server/models/environment";
import { Environment } from "../../../server/types";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildGroup,
  buildTeam,
  buildUser,
  logger,
} from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  return db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

afterAll(() => dropTestDb());

describe("createDefaultEnvironments", () => {
  afterAll(() => db("environments").del());

  it("creates default environments for a team", async () => {
    await createDefaultEnvironments("teamId", { logger });

    const environments = await db("environments")
      .select("*")
      .orderBy("name", "asc");

    expect(environments).toMatchObject([
      { name: "Production", team_id: "teamId" },
      { name: "Staging", team_id: "teamId" },
    ]);
  });
});

describe("createEnvironment", () => {
  afterAll(() => db("environments").del());

  it("creates an environment", async () => {
    const expected = {
      name: "New Environment",
      team_id: "teamId",
    };

    const environment = await createEnvironment(
      { name: "New Environment", team_id: "teamId" },
      { logger }
    );

    const dbEnvironment = await db("environments").select("*").first();

    expect(environment).toMatchObject(expected);
    expect(dbEnvironment).toMatchObject(expected);
  });

  it("throws an error if name not provided", async () => {
    const testFn = async (): Promise<Environment> => {
      return createEnvironment({ name: "", team_id: "teamId" }, { logger });
    };

    await expect(testFn()).rejects.toThrowError("Must provide name");
  });
});

describe("deleteEnvironment", () => {
  beforeAll(async () => {
    await db("environments").insert([
      buildEnvironment({}),
      buildEnvironment({ i: 2, name: "Production" }),
    ]);

    await db("environment_variables").insert([
      buildEnvironmentVariable({ i: 1 }),
      buildEnvironmentVariable({ i: 2 }),
      buildEnvironmentVariable({ environment_id: "environment2Id", i: 3 }),
    ]);

    return db("groups").insert(buildGroup({ environment_id: "environmentId" }));
  });

  afterAll(async () => {
    await db("groups").del();

    await db("environment_variables").del();

    return db("environments").del();
  });

  it("deletes an environment and all associated environment variables", async () => {
    const environment = await deleteEnvironment("environmentId", { logger });

    expect(environment.id).toBe("environmentId");

    const dbEnvironments = await db("environments").select("*");

    expect(dbEnvironments).toMatchObject([
      { id: "environment2Id", name: "Production" },
    ]);

    const dbEnvironmentVariables = await db("environment_variables").select(
      "*"
    );

    expect(dbEnvironmentVariables).toMatchObject([
      { id: "environmentVariable3Id" },
    ]);

    const dbGroup = await db("groups").select("*").first();
    expect(dbGroup.environment_id).toBeNull();
  });
});

describe("findEnvironment", () => {
  beforeAll(() => {
    return db("environments").insert(buildEnvironment({}));
  });

  afterAll(() => db("environments").del());

  it("finds an environment", async () => {
    const environment = await findEnvrionment("environmentId", { logger });

    expect(environment).toMatchObject({ name: "Staging", team_id: "teamId" });
  });

  it("throws an error if environment not found", async () => {
    const testFn = async (): Promise<Environment> => {
      return findEnvrionment("fakeId", { logger });
    };

    await expect(testFn()).rejects.toThrowError("not found");
  });
});

describe("findEnvironmentsForTeam", () => {
  beforeAll(() => {
    return db("environments").insert([
      buildEnvironment({}),
      buildEnvironment({ i: 2, name: "Production" }),
      buildEnvironment({ i: 3, name: "Other", team_id: "team2Id" }),
    ]);
  });

  afterAll(() => db("environments").del());

  it("finds environments for a team", async () => {
    const environments = await findEnvironmentsForTeam("teamId", { logger });

    expect(environments).toMatchObject([
      { name: "Production" },
      { name: "Staging" },
    ]);
  });
});

describe("updateEnvironment", () => {
  beforeAll(() => {
    return db("environments").insert(buildEnvironment({}));
  });

  afterAll(() => db("environments").del());

  it("updates an environment", async () => {
    const environment = await updateEnvironment(
      { id: "environmentId", name: "New Name" },
      { logger }
    );

    const dbEnvironment = await db("environments").select("*").first();

    expect(environment.name).toBe("New Name");
    expect(dbEnvironment.name).toBe("New Name");
  });

  it("throws an error if name not provided", async () => {
    const testFn = async (): Promise<Environment> => {
      return updateEnvironment({ id: "environmentId", name: "" }, { logger });
    };

    await expect(testFn()).rejects.toThrowError("Must provide name");
  });
});
