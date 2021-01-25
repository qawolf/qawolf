import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createApiKey,
  deleteApiKey,
  findApiKey,
  findApiKeysForTeam,
  updateApiKey,
  validateToken,
} from "../../../server/models/api_key";
import { ApiKey } from "../../../server/types";
import { buildDigest } from "../../../server/utils";
import { minutesFromNow } from "../../../shared/utils";
import { buildApiKey, buildTeam, logger } from "../utils";

beforeAll(async () => {
  await migrateDb();

  return db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

afterAll(() => dropTestDb());

describe("api key model", () => {
  describe("createApiKey", () => {
    afterAll(() => db("api_keys").del());

    it("creates an api key", async () => {
      await createApiKey(
        { name: "Spirit", team_id: "teamId", token: "secret" },
        { logger }
      );

      const apiKey = await db.select("*").from("api_keys").first();

      expect(apiKey).toMatchObject({
        id: expect.any(String),
        last_used_at: null,
        name: "Spirit",
        team_id: "teamId",
        token_end: "cret",
      });
      expect(apiKey.token_digest).not.toBe("secret");
    });
  });

  describe("deleteApiKey", () => {
    beforeAll(() => {
      return db("api_keys").insert([buildApiKey({}), buildApiKey({ i: 2 })]);
    });

    afterAll(() => db("api_keys").del());

    it("deletes an api key", async () => {
      await deleteApiKey("apiKeyId", { logger });
      const apiKeys = await db.select("*").from("api_keys");

      expect(apiKeys).toMatchObject([{ id: "apiKey2Id" }]);
    });
  });

  describe("findApiKey", () => {
    beforeAll(() => {
      return db("api_keys").insert([buildApiKey({}), buildApiKey({ i: 2 })]);
    });

    afterAll(() => db("api_keys").del());

    it("finds an api key", async () => {
      const apiKey = await findApiKey("apiKeyId", { logger });

      expect(apiKey).toMatchObject({ id: "apiKeyId" });
    });

    it("throws an error if api key not found", async () => {
      const testFn = async (): Promise<ApiKey> => {
        return findApiKey("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("invalid api key");
    });
  });

  describe("findApiKeysForTeam", () => {
    beforeAll(() => {
      return db("api_keys").insert([
        buildApiKey({ name: "B Key" }),
        buildApiKey({ i: 2, name: "A Key" }),
        buildApiKey({ i: 3, team_id: "team2Id" }),
      ]);
    });

    afterAll(() => db("api_keys").del());

    it("finds api keys for a team", async () => {
      const apiKeys = await findApiKeysForTeam("teamId", { logger });

      expect(apiKeys).toMatchObject([
        { id: "apiKey2Id", name: "A Key" },
        { id: "apiKeyId", name: "B Key" },
      ]);
    });
  });

  describe("updateApiKey", () => {
    beforeAll(() => {
      return db("api_keys").insert([
        buildApiKey({ name: "A Key" }),
        buildApiKey({ i: 2, name: "B Key" }),
      ]);
    });

    afterAll(() => db("api_keys").del());

    it("updates an api key", async () => {
      const last_used_at = minutesFromNow();
      const updatedKey = await updateApiKey(
        { id: "apiKeyId", last_used_at },
        { logger }
      );

      expect(updatedKey.last_used_at).toBe(last_used_at);

      const apiKeys = await findApiKeysForTeam("teamId", { logger });

      expect(apiKeys).toMatchObject([
        { id: "apiKeyId", last_used_at: new Date(last_used_at) },
        { id: "apiKey2Id", last_used_at: null },
      ]);
    });
  });

  describe("validateToken", () => {
    beforeAll(async () => {
      const token_digest = await buildDigest("secret");

      return db("api_keys").insert([
        buildApiKey({ name: "B Key", token_digest }),
        buildApiKey({ i: 2, name: "A Key" }),
      ]);
    });

    afterAll(() => db("api_keys").del());

    it("does not throw an error if token is valid", async () => {
      const testFn = async (): Promise<void> => {
        return validateToken(
          { team_id: "teamId", token: "secret" },
          { logger }
        );
      };

      await expect(testFn()).resolves.not.toThrowError();

      const apiKey = await db
        .select("*")
        .from("api_keys")
        .where({ id: "apiKeyId" })
        .first();

      expect(apiKey.last_used_at).toBeTruthy();

      await db("api_keys").update({ last_used_at: null });
    });

    it("throws an error if token is invalid", async () => {
      const testFn = async (): Promise<void> => {
        return validateToken(
          { team_id: "teamId", token: "invalid" },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("invalid api key");

      const apiKey = await db
        .select("*")
        .from("api_keys")
        .where({ id: "apiKeyId" })
        .first();

      expect(apiKey.last_used_at).toBeNull();
    });

    it("throws an error if no api keys for team", async () => {
      const testFn = async (): Promise<void> => {
        return validateToken(
          { team_id: "team2Id", token: "secret" },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("invalid api key");
    });
  });
});
