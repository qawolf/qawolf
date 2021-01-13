import { db } from "../db";
import { AuthenticationError } from "../errors";
import { ApiKey, ModelOptions } from "../types";
import { buildDigest, cuid, isCorrectCode, minutesFromNow } from "../utils";

const END_CHARACTER_COUNT = 4;

type CreateApiKey = {
  name: string;
  team_id: string;
  token: string;
};

type UpdateApiKey = {
  id: string;
  last_used_at: string;
};

type ValidateToken = {
  team_id: string;
  token: string;
};

export const createApiKey = async (
  { name, team_id, token }: CreateApiKey,
  { logger, trx }: ModelOptions
): Promise<ApiKey> => {
  const log = logger.prefix("createApiKey");
  log.debug("team", team_id);

  const timestamp = minutesFromNow();

  const apiKey = {
    created_at: timestamp,
    id: cuid(),
    last_used_at: null,
    name,
    team_id,
    token_digest: await buildDigest(token),
    token_end: token.slice(-END_CHARACTER_COUNT),
    updated_at: timestamp,
  };
  await (trx || db)("api_keys").insert(apiKey);

  log.debug("created", apiKey.id);

  return apiKey;
};

export const deleteApiKey = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("deleteApiKey");
  log.debug(id);

  const deleteCount = await (trx || db)("api_keys").where({ id }).del();
  log.debug(`deleted ${deleteCount} api keys`);

  return id;
};

export const findApiKey = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<ApiKey> => {
  const log = logger.prefix("findApiKey");
  log.debug(id);

  const apiKey = await (trx || db)
    .select("*")
    .from("api_keys")
    .where({ id })
    .first();

  if (!apiKey) {
    log.error("not found", id);
    throw new AuthenticationError("invalid api key");
  }

  log.debug("found", id);
  return apiKey;
};

export const findApiKeysForTeam = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<ApiKey[]> => {
  const log = logger.prefix("findApiKeysForTeam");
  log.debug("team", team_id);

  const apiKeys = await (trx || db)
    .select("*")
    .from("api_keys")
    .where({ team_id })
    .orderBy("name", "asc");

  log.debug(`found ${apiKeys.length} api keys`);

  return apiKeys;
};

export const updateApiKey = async (
  { id, last_used_at }: UpdateApiKey,
  { logger, trx }: ModelOptions
): Promise<ApiKey> => {
  const log = logger.prefix("updateApiKey");
  log.debug(id);

  const apiKey = await findApiKey(id, { logger, trx });

  const updates = {
    last_used_at,
    updated_at: minutesFromNow(),
  };
  await (trx || db)("api_keys").where({ id }).update(updates);
  log.debug("updated", updates);

  return { ...apiKey, ...updates };
};

export const validateToken = async (
  { team_id, token }: ValidateToken,
  { logger, trx }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("validateToken");
  log.debug("team", team_id);

  const apiKeys = await findApiKeysForTeam(team_id, { logger, trx });

  const matches = await Promise.all(
    apiKeys.map(({ token_digest }) => {
      return isCorrectCode({ code: token, digest: token_digest });
    })
  );

  const matchIndex = matches.findIndex((match) => match);
  if (matchIndex < 0) {
    log.error("invalid  api key for team", team_id);
    throw new AuthenticationError("invalid api key");
  }

  const { id } = apiKeys[matchIndex];
  log.debug("valid api key", id);

  await updateApiKey({ id, last_used_at: minutesFromNow() }, { logger, trx });
};
