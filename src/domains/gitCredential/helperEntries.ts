import type { SpawnFn, SpawnResult } from "~/shell/spawn.js";

export type GitConfigDeps = {
  readonly platform: NodeJS.Platform;
  readonly spawn: SpawnFn;
};

export type Failure = { readonly detail: string; readonly status: "failed" };

type HelperEntries =
  | Failure
  | { readonly status: "git-missing" }
  | {
      readonly entries: readonly string[];
      readonly file: string | undefined;
      readonly status: "read";
    };

const keyNotFoundExitCode = 1;
const valueNotFoundExitCode = 5;
const cliEntryPattern = "^!.* auth git-credential$";

export function helperKey(hostUrl: string): string {
  return `credential.${hostUrl}.helper`;
}

export function failure(result: SpawnResult): Failure {
  return {
    detail: result.stderr.trim() || `git exited with ${result.exitCode}`,
    status: "failed",
  };
}

export function runGitConfig({
  args,
  deps,
}: {
  args: string[];
  deps: GitConfigDeps;
}): Promise<SpawnResult> {
  return deps.spawn("git", ["config", "--global", ...args], {
    platform: deps.platform,
  });
}

export async function readHelperEntries({
  deps,
  hostUrl,
}: {
  deps: GitConfigDeps;
  hostUrl: string;
}): Promise<HelperEntries> {
  const result = await runGitConfig({
    args: ["--show-origin", "--null", "--get-all", helperKey(hostUrl)],
    deps,
  });
  if (result.exitCode < 0) return { status: "git-missing" };
  if (result.exitCode === keyNotFoundExitCode) {
    return { entries: [], file: undefined, status: "read" };
  }
  if (result.exitCode !== 0) return failure(result);
  const fields = result.stdout.split("\0");
  const origins = fields.filter((_field, index) => index % 2 === 0);
  const values = fields.filter((_field, index) => index % 2 === 1);
  const [firstOrigin] = origins;
  return {
    entries: values,
    file: firstOrigin?.replace(/^file:/, ""),
    status: "read",
  };
}

export async function unsetCliEntries({
  deps,
  hostUrl,
}: {
  deps: GitConfigDeps;
  hostUrl: string;
}): Promise<Failure | undefined> {
  const result = await runGitConfig({
    args: ["--unset-all", helperKey(hostUrl), cliEntryPattern],
    deps,
  });
  if (result.exitCode === 0 || result.exitCode === valueNotFoundExitCode) {
    return undefined;
  }
  return failure(result);
}
