import { db } from "../db";
import {
  createApiKey,
  deleteApiKey,
  findApiKey,
  findApiKeysForTeam,
} from "../models/api_key";
import {
  ApiKey,
  Context,
  CreateApiKeyMutation,
  IdQuery,
  TeamIdQuery,
} from "../types";
import { buildApiKey } from "../utils";
import { ensureTeamAccess } from "./utils";

/**
 * @returns All API keys for the team. The token field is always null for security reasons.
 */
export const apiKeysResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { logger, teams }: Context
): Promise<Array<ApiKey & { token: null }>> => {
  const log = logger.prefix("apiKeysResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  const apiKeys = await findApiKeysForTeam(team_id, { logger });

  return apiKeys.map((apiKey) => {
    return { ...apiKey, token: null, token_digest: null };
  });
};

/**
 * @returns The API key object with plain text `token` included
 */
export const createApiKeyResolver = async (
  _: Record<string, unknown>,
  { name, team_id }: CreateApiKeyMutation,
  { logger, teams }: Context
): Promise<ApiKey & { token: string }> => {
  const log = logger.prefix("createApiKeyResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  const token = buildApiKey();
  const apiKey = await createApiKey({ name, team_id, token }, { logger });

  return { ...apiKey, token, token_digest: null };
};

/**
 * @returns The API key object without `token` field
 */
export const deleteApiKeyResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<ApiKey & { token: null }> => {
  const log = logger.prefix("deleteApiKeyResolver");
  log.debug(id);

  const apiKey = await db.transaction(async (trx) => {
    const apiKey = await findApiKey(id, { logger, trx });
    ensureTeamAccess({ logger, team_id: apiKey.team_id, teams });

    await deleteApiKey(id, { logger, trx });

    return apiKey;
  });

  return { ...apiKey, token: null, token_digest: null };
};
