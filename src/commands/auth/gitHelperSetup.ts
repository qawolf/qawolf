import { authMessages } from "~/core/messages/index.js";
import {
  defaultCliInvocation,
  type GitConfigDeps,
  type GitHelperRemoval,
  type GitHelperSetup,
  removeGitCredentialHelper,
  resolveHelperCommand,
  setUpGitCredentialHelper,
} from "~/domains/gitCredential/index.js";
import type { CommandContext } from "~/shell/commandContext.js";
import { defaultSpawn } from "~/shell/spawn.js";
import type { UI } from "~/shell/ui/index.js";

const defaultGitConfigDeps: GitConfigDeps = {
  platform: process.platform,
  spawn: defaultSpawn,
};

function reportSetup({ result, ui }: { result: GitHelperSetup; ui: UI }): void {
  switch (result.status) {
    case "added":
      ui.info(authMessages.gitHelper.added(result.file));
      ui.note(result.lines);
      return;
    case "unchanged":
      ui.info(authMessages.gitHelper.unchanged);
      return;
    case "git-missing":
      ui.info(authMessages.gitHelper.gitMissing);
      return;
    case "temporary-install":
      ui.warn(authMessages.gitHelper.temporaryInstall);
      return;
    case "failed":
      ui.warn(authMessages.gitHelper.failed(result.detail));
      return;
  }
}

function reportRemoval({
  result,
  ui,
}: {
  result: GitHelperRemoval;
  ui: UI;
}): void {
  if (result.status === "removed") {
    ui.info(authMessages.gitHelper.removed(result.file));
    ui.note(result.lines);
  }
  if (result.status === "failed") {
    ui.warn(authMessages.gitHelper.removalFailed(result.detail));
  }
}

export async function configureGitCredentialHelper(
  ctx: CommandContext,
): Promise<void> {
  reportSetup({
    result: await setUpGitCredentialHelper({
      deps: defaultGitConfigDeps,
      helperCommand: resolveHelperCommand(defaultCliInvocation()),
      hostUrl: ctx.apiBaseUrl,
    }),
    ui: ctx.ui,
  });
}

export async function unconfigureGitCredentialHelper(
  ctx: CommandContext,
): Promise<void> {
  reportRemoval({
    result: await removeGitCredentialHelper({
      deps: defaultGitConfigDeps,
      hostUrl: ctx.apiBaseUrl,
    }),
    ui: ctx.ui,
  });
}
