import { publicContractsV1 } from "@qawolf/api-contracts/v1";

import { interactiveRunnerMessages } from "~/core/messages/index.js";
import type {
  AuthCommandContext,
  CommandResult,
} from "~/shell/commandContext.js";
import { failureFields } from "~/shell/platform/requestWithRetry.js";

import type { InteractiveRunnerDeps } from "./deps.js";
import { describeSnapshotFailure } from "./pageSnapshotFailure.js";
import { resolveRunner } from "./resolveRunner.js";
import { runnerCallOptions } from "./runnerCallOptions.js";
import { runnerRequestFailure } from "./runnerRequestFailure.js";

/**
 * Prints the accessibility outline of the runner's page, with a ref on each
 * element for `qawolf runner ref` to act on. Plain text on stdout, so an agent
 * reads it as it stands.
 */
export async function handleRunnerSnapshotPage(
  ctx: AuthCommandContext,
  options: { interactiveOnly: boolean; runner: string | undefined },
  deps: InteractiveRunnerDeps,
): Promise<CommandResult> {
  // Never launches: a runner launched for this command would only show the
  // welcome page.
  const resolved = await resolveRunner(
    ctx,
    {
      autoLaunch: false,
      noRunnerIdMessage: interactiveRunnerMessages.noRunnerIdForPageSnapshot,
      runner: options.runner,
    },
    deps,
  );
  if (resolved.type === "failed") {
    return { ...failureFields(resolved), exitCode: resolved.exitCode };
  }

  const result = await ctx.platformClient.callPublicApi(
    publicContractsV1.runner.snapshotPage,
    { id: resolved.runnerId, interactiveOnly: options.interactiveOnly },
    runnerCallOptions,
  );
  if (!result.ok) return runnerRequestFailure(result, resolved);

  const answer = result.value;
  if (answer.outcome === "failure") {
    return describeSnapshotFailure(answer.failureReason);
  }
  ctx.ui.stream(
    answer,
    `url: ${answer.url}\ntitle: ${answer.title}\n\n${answer.snapshot}`,
  );
  return undefined;
}
