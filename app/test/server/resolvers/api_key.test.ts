import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  apiKeysResolver,
  createApiKeyResolver,
  deleteApiKeyResolver,
} from "../../../server/resolvers/api_key";
import { ApiKey } from "../../../server/types";
import { buildApiKey, buildTeam, buildUser, testContext } from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

afterAll(() => dropTestDb());

describe("apiKeysResolver", () => {
  beforeAll(() => {
    return db("api_keys").insert([
      buildApiKey({ name: "B Key" }),
      buildApiKey({ i: 2, name: "A Key" }),
      buildApiKey({ i: 3, team_id: "team2Id" }),
    ]);
  });

  afterAll(() => db("api_keys").del());

  it("finds api keys for a team", async () => {
    const apiKeys = await apiKeysResolver(
      {},
      { team_id: "teamId" },
      testContext
    );

    expect(apiKeys).toMatchObject([
      { id: "apiKey2Id", name: "A Key", token: null, token_digest: null },
      { id: "apiKeyId", name: "B Key", token: null, token_digest: null },
    ]);
  });
});

describe("createApiKeyResolver", () => {
  afterAll(() => db("api_keys").del());

  it("creates an api key", async () => {
    const apiKey = await createApiKeyResolver(
      {},
      { name: "My Key", team_id: "teamId" },
      testContext
    );

    expect(apiKey.token).toMatch("qawolf_");
    expect(apiKey).toMatchObject({
      name: "My Key",
      team_id: "teamId",
      token_digest: null,
      token_end: apiKey.token.slice(-4),
    });

    const dbApiKey = await db.select("*").from("api_keys").first();

    expect(dbApiKey).toMatchObject({ name: "My Key" });
  });
});

describe("deleteApiKeyResolver", () => {
  beforeAll(() => {
    return db("api_keys").insert([buildApiKey({}), buildApiKey({ i: 2 })]);
  });

  afterAll(() => db("api_keys").del());

  it("deletes an api key", async () => {
    const apiKey = await deleteApiKeyResolver(
      {},
      { id: "apiKeyId" },
      testContext
    );

    expect(apiKey).toMatchObject({
      id: "apiKeyId",
      token: null,
      token_digest: null,
    });

    const apiKeys = await db.select("*").from("api_keys");

    expect(apiKeys).toMatchObject([{ id: "apiKey2Id" }]);
  });

  it("throws an error if cannot access team", async () => {
    const testFn = async (): Promise<ApiKey> => {
      return deleteApiKeyResolver(
        {},
        { id: "apiKey2Id" },
        { ...testContext, teams: [{ ...buildTeam({ i: 2 }) }] }
      );
    };

    await expect(testFn()).rejects.toThrowError("cannot access team");
  });
});
