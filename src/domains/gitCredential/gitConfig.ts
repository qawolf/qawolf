import { type HelperCommand, isCliHelperEntry } from "./helperCommand.js";
import {
  addEntry,
  type Failure,
  type GitConfigDeps,
  helperListReset,
  isCliEntry,
  readHelperEntries,
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

function hasSameEntries({
  actual,
  expected,
}: {
  actual: readonly string[];
  expected: readonly string[];
}): boolean {
  return (
    actual.length === expected.length &&
    actual.every((entry, index) => entry === expected[index])
  );
}

function isInPlace({
  cliEntries,
  entries,
}: {
  cliEntries: readonly string[];
  entries: readonly string[];
}): boolean {
  return (
    hasSameEntries({
      actual: entries.filter(isCliEntry),
      expected: cliEntries,
    }) &&
    hasSameEntries({
      actual: entries.slice(-cliEntries.length),
      expected: cliEntries,
    })
  );
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
  const cliEntries = [helperListReset, helperCommand.command];
  const lines = describeLines({ entries: cliEntries, hostUrl });
  if (isInPlace({ cliEntries, entries: current.entries })) {
    return { file: current.file, lines, status: "unchanged" };
  }
  const writeFailure =
    (await unsetCliEntries({ deps, hostUrl })) ??
    (await addEntry({ deps, entry: helperListReset, hostUrl })) ??
    (await addEntry({ deps, entry: helperCommand.command, hostUrl }));
  if (writeFailure) return writeFailure;
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
  if (!current.entries.some(isCliHelperEntry)) return { status: "none" };
  const unsetFailure = await unsetCliEntries({ deps, hostUrl });
  if (unsetFailure) return unsetFailure;
  return {
    file: current.file,
    lines: describeLines({
      entries: current.entries.filter(isCliEntry),
      hostUrl,
    }),
    status: "removed",
  };
}
