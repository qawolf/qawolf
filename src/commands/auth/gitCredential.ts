import { text } from "node:stream/consumers";

import { authMessages } from "~/core/messages/index.js";
import { getConfigDir } from "~/core/paths.js";
import { resolveApiKey } from "~/domains/auth/index.js";
import type { ApiKeyResult } from "~/domains/auth/types.js";
import { answerCredentialRequest } from "~/domains/gitCredential/index.js";
import { makeDefaultFs } from "~/shell/fs.js";
import { resolveHostUrl } from "~/shell/resolveHostUrl.js";

export type GitCredentialDeps = {
  readonly hostUrl: string;
  readonly readRequest: () => Promise<string>;
  readonly resolveCredential: () => Promise<ApiKeyResult | undefined>;
  readonly writeError: (message: string) => void;
  readonly writeOutput: (output: string) => void;
};

export function defaultGitCredentialDeps(): GitCredentialDeps {
  return {
    hostUrl: resolveHostUrl(process.env),
    readRequest: () => text(process.stdin),
    resolveCredential: () => resolveApiKey(getConfigDir(), makeDefaultFs()),
    writeError: (message) => process.stderr.write(message),
    writeOutput: (output) => process.stdout.write(output),
  };
}

export async function handleGitCredential({
  deps,
  operation,
}: {
  deps: GitCredentialDeps;
  operation: string;
}): Promise<void> {
  const answer = await answerCredentialRequest({
    hostUrl: deps.hostUrl,
    operation,
    readRequest: deps.readRequest,
    resolveCredential: deps.resolveCredential,
  });
  if (answer.status === "answered") deps.writeOutput(answer.output);
  if (answer.status === "signed-out") {
    deps.writeError(`${authMessages.gitHelper.signedOut}\n`);
  }
  if (answer.status === "team-api-key") {
    deps.writeError(`${authMessages.gitHelper.teamApiKey}\n`);
  }
}
