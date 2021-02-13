import {
  createDefaultEnvironments,
  createEnvironment,
  deleteEnvironment,
  findEnvironment,
  findEnvironmentIdForRun,
  findEnvironmentsForTeam,
  updateEnvironment,
} from "../../../server/models/environment";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildRun,
  buildSuite,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  return db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

describe("createDefaultEnvironments", () => {
  afterAll(() => db("environments").del());

  it("creates default environments for a team", async () => {
    await createDefaultEnvironments("teamId", options);

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
      options
    );

    const dbEnvironment = await db("environments").select("*").first();

    expect(environment).toMatchObject(expected);
    expect(dbEnvironment).toMatchObject(expected);
  });

  it("throws an error if name not provided", async () => {
    await expect(
      createEnvironment({ name: "", team_id: "teamId" }, options)
    ).rejects.toThrowError("Must provide name");
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

    return db("triggers").insert(
      buildTrigger({ environment_id: "environmentId" })
    );
  });

  afterAll(async () => {
    await db("triggers").del();

    await db("environment_variables").del();

    return db("environments").del();
  });

  it("deletes an environment and all associated environment variables", async () => {
    const environment = await deleteEnvironment("environmentId", {
      db,
      logger,
    });

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

    const dbTrigger = await db("triggers").select("*").first();
    expect(dbTrigger.environment_id).toBeNull();
  });
});

describe("findEnvironment", () => {
  beforeAll(() => {
    return db("environments").insert(buildEnvironment({}));
  });

  afterAll(() => db("environments").del());

  it("finds an environment", async () => {
    const environment = await findEnvironment("environmentId", options);

    expect(environment).toMatchObject({ name: "Staging", team_id: "teamId" });
  });

  it("throws an error if environment not found", async () => {
    await expect(findEnvironment("fakeId", options)).rejects.toThrowError(
      "not found"
    );
  });
});

describe("findEnvironmentIdForRun", () => {
  beforeAll(async () => {
    await db("tests").insert(buildTest({}));

    await db("environments").insert(buildEnvironment({}));

    await db("triggers").insert([
      buildTrigger({ environment_id: "environmentId" }),
      buildTrigger({ i: 2 }),
    ]);

    await db("suites").insert([
      buildSuite({}),
      buildSuite({ i: 2, trigger_id: "trigger2Id" }),
    ]);

    await db("runs").insert([
      buildRun({ suite_id: "suiteId" }),
      buildRun({ i: 2, suite_id: "suite2Id" }),
    ]);
  });

  afterAll(async () => {
    await db("runs").del();
    await db("suites").del();
    await db("triggers").del();
    await db("environments").del();
    await db("tests").del();
  });

  it("returns an environment id for a run", async () => {
    const environment = await findEnvironmentIdForRun("runId", options);

    expect(environment).toBe("environmentId");
  });

  it("returns null if run does not have an environment", async () => {
    const environment = await findEnvironmentIdForRun("run2Id", options);

    expect(environment).toBeNull();
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
    const environments = await findEnvironmentsForTeam("teamId", {
      db,
      logger,
    });

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
      options
    );

    const dbEnvironment = await db("environments").select("*").first();

    expect(environment.name).toBe("New Name");
    expect(dbEnvironment.name).toBe("New Name");
  });

  it("throws an error if name not provided", async () => {
    await expect(
      updateEnvironment({ id: "environmentId", name: "" }, options)
    ).rejects.toThrowError("Must provide name");
  });
});
