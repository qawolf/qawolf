import { type HelperCommand, isCliHelperEntry } from "./helperCommand.js";
import {
  type Failure,
  failure,
  type GitConfigDeps,
  helperKey,
  readHelperEntries,
  runGitConfig,
  unsetCliEntries,
} from "./helperEntries.js";

export type GitHelperSetup =
  | Failure
  | { readonly status: "git-missing" | "temporary-install" }
  | {
      readonly file: string | undefined;
      readonly lines: string;
      readonly status: "added" | "unchanged";
    };

export type GitHelperRemoval =
  | Failure
  | { readonly status: "git-missing" | "none" }
  | {
      readonly file: string | undefined;
      readonly lines: string;
      readonly status: "removed";
    };

function describeLines({
  entries,
  hostUrl,
}: {
  entries: readonly string[];
  hostUrl: string;
}): string {
  return [
    `[credential "${hostUrl}"]`,
    ...entries.map((entry) => `\thelper = ${entry}`),
  ].join("\n");
}

export async function setUpGitCredentialHelper({
  deps,
  helperCommand,
  hostUrl,
}: {
  deps: GitConfigDeps;
  helperCommand: HelperCommand;
  hostUrl: string;
}): Promise<GitHelperSetup> {
  if (helperCommand.status === "temporary-install") return helperCommand;
  const current = await readHelperEntries({ deps, hostUrl });
  if (current.status !== "read") return current;
  const lines = describeLines({ entries: [helperCommand.command], hostUrl });
  if (current.entries.includes(helperCommand.command)) {
    return { file: current.file, lines, status: "unchanged" };
  }
  const unsetFailure = await unsetCliEntries({ deps, hostUrl });
  if (unsetFailure) return unsetFailure;
  const added = await runGitConfig({
    args: ["--add", helperKey(hostUrl), helperCommand.command],
    deps,
  });
  if (added.exitCode !== 0) return failure(added);
  const after = await readHelperEntries({ deps, hostUrl });
  return {
    file: after.status === "read" ? after.file : undefined,
    lines,
    status: "added",
  };
}

export async function removeGitCredentialHelper({
  deps,
  hostUrl,
}: {
  deps: GitConfigDeps;
  hostUrl: string;
}): Promise<GitHelperRemoval> {
  const current = await readHelperEntries({ deps, hostUrl });
  if (current.status !== "read") return current;
  const cliEntries = current.entries.filter(isCliHelperEntry);
  if (cliEntries.length === 0) return { status: "none" };
  const unsetFailure = await unsetCliEntries({ deps, hostUrl });
  if (unsetFailure) return unsetFailure;
  return {
    file: current.file,
    lines: describeLines({ entries: cliEntries, hostUrl }),
    status: "removed",
  };
}
