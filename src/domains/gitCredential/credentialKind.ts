import type { ApiKeyResult } from "~/domains/auth/types.js";

const teamApiKeyPrefix = "qawolf_";

export function isTeamApiKey(credential: ApiKeyResult): boolean {
  return credential.key.startsWith(teamApiKeyPrefix);
}
