import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
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
  buildTeam,
  logger,
} from "../utils";

beforeAll(async () => {
  await migrateDb();

  return db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

afterAll(() => dropTestDb());

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

    return db("environment_variables").insert([
      buildEnvironmentVariable({ i: 1 }),
      buildEnvironmentVariable({ i: 2 }),
      buildEnvironmentVariable({ environment_id: "environment2Id", i: 3 }),
    ]);
  });

  afterAll(async () => {
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
