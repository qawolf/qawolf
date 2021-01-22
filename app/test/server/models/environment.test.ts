import { db, dropTestDb, migrateDb } from "../../../server/db";
import { findEnvrionment } from "../../../server/models/environment";
import { Environment } from "../../../server/types";
import { buildEnvironment, buildTeam, logger } from "../utils";

beforeAll(async () => {
  await migrateDb();

  return db("teams").insert(buildTeam({}));
});

afterAll(() => dropTestDb());

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
