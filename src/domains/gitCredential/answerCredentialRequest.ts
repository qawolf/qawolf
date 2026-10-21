import { readAccessTokenExpiry } from "~/core/deviceAuth/tokenExpiry.js";
import type { ApiKeyResult } from "~/domains/auth/types.js";

import { isTeamApiKey } from "./credentialKind.js";

export type CredentialAnswer =
  | { readonly output: string; readonly status: "answered" }
  | {
      readonly status:
        | "not-a-lookup"
        | "other-host"
        | "signed-out"
        | "team-api-key";
    };

const gitUsername = "qawolf";
const millisecondsPerSecond = 1_000;

function readAttributes(input: string): Map<string, string> {
  return new Map(
    input
      .split("\n")
      .filter((line) => line.includes("="))
      .map((line) => [
        line.slice(0, line.indexOf("=")),
        line.slice(line.indexOf("=") + 1),
      ]),
  );
}

function isRequestForHost({
  attributes,
  hostUrl,
}: {
  attributes: Map<string, string>;
  hostUrl: string;
}): boolean {
  const host = new URL(hostUrl);
  return (
    attributes.get("protocol") === host.protocol.replace(/:$/, "") &&
    attributes.get("host") === host.host
  );
}

export async function answerCredentialRequest({
  hostUrl,
  operation,
  readRequest,
  resolveCredential,
}: {
  hostUrl: string;
  operation: string;
  readRequest: () => Promise<string>;
  resolveCredential: () => Promise<ApiKeyResult | undefined>;
}): Promise<CredentialAnswer> {
  if (operation !== "get") return { status: "not-a-lookup" };
  const attributes = readAttributes(await readRequest());
  if (!isRequestForHost({ attributes, hostUrl })) {
    return { status: "other-host" };
  }
  const credential = await resolveCredential();
  if (!credential) return { status: "signed-out" };
  if (isTeamApiKey(credential)) {
    return { status: "team-api-key" };
  }
  const expiresAtMs =
    credential.source === "browser"
      ? readAccessTokenExpiry(credential.key)
      : undefined;
  const lines = [
    `username=${gitUsername}`,
    `password=${credential.key}`,
    ...(expiresAtMs === undefined
      ? []
      : [
          `password_expiry_utc=${Math.floor(expiresAtMs / millisecondsPerSecond)}`,
        ]),
  ];
  return {
    output: lines.map((line) => `${line}\n`).join(""),
    status: "answered",
  };
}
