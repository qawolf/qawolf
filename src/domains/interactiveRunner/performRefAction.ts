import { publicContractsV1 } from "@qawolf/api-contracts/v1";

import { buildRefAction } from "~/core/interactiveRunner/refAction.js";
import { interactiveRunnerMessages } from "~/core/messages/index.js";
import { appendSentence } from "~/core/sentences.js";
import type {
  AuthCommandContext,
  CommandResult,
} from "~/shell/commandContext.js";
import { exitCodes } from "~/shell/exit.js";
import { stdoutPath } from "~/shell/interactiveRunner/writeScreenshot.js";
import { failureFields } from "~/shell/platform/requestWithRetry.js";

import type { InteractiveRunnerDeps } from "./deps.js";
import { describeRefActionFailure } from "./pageSnapshotFailure.js";
import {
  addFailureScreenshot,
  writeActionScreenshot,
} from "./performActionScreenshot.js";
import { takeScreenAfterRefAction } from "./refActionScreen.js";
import { resolveRunner } from "./resolveRunner.js";
import { runnerCallOptions } from "./runnerCallOptions.js";
import { runnerRequestFailure } from "./runnerRequestFailure.js";

/**
 * Acts on the element a ref from `qawolf runner snapshot` names, and prints
 * that element's Playwright locator so it can go straight into flow code.
 *
 * With `screenshot` set, the screen is taken after the action and written the
 * way `qawolf runner act --screenshot` writes one, including after an action
 * that reached the element and did not complete.
 */
export async function handleRunnerRefAction(
  ctx: AuthCommandContext,
  options: {
    ref: string;
    runner: string | undefined;
    /** Where to write the screen taken after the action; `-` for stdout. */
    screenshot: string | undefined;
    values: string[];
    verb: string;
  },
  deps: InteractiveRunnerDeps,
): Promise<CommandResult> {
  const built = buildRefAction(options);
  if (!built.ok) return { error: built.error, exitCode: exitCodes.invalidArgs };
  if (options.screenshot === stdoutPath && ctx.outputMode === "human") {
    return {
      error: interactiveRunnerMessages.stdoutIsATerminal("--screenshot"),
      exitCode: exitCodes.invalidArgs,
    };
  }

  // Never launches: a fresh runner has no refs to act on.
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
    publicContractsV1.runner.performRefAction,
    { action: built.action, id: resolved.runnerId },
    runnerCallOptions,
  );
  if (!result.ok) {
    const fields = runnerRequestFailure(result, resolved);
    return result.mayHaveArrived
      ? {
          ...fields,
          error: appendSentence(
            fields.error,
            interactiveRunnerMessages.actionMayHaveHappened,
          ),
        }
      : fields;
  }

  const answer = result.value;
  if (answer.outcome === "failure") {
    const failure = describeRefActionFailure({
      failure: answer,
      ref: options.ref,
    });
    if (
      options.screenshot === undefined ||
      answer.failureReason !== "action-failed"
    ) {
      return failure;
    }
    const screen = await takeScreenAfterRefAction(ctx, resolved.runnerId);
    return addFailureScreenshot(
      {
        failure,
        imageJpegBase64: screen.ok ? screen.imageJpegBase64 : undefined,
        out: options.screenshot,
      },
      deps,
    );
  }

  const locatorLine = interactiveRunnerMessages.locatorLine(answer.locator);
  const performed = { action: built.action, locator: answer.locator };
  if (options.screenshot === undefined) {
    ctx.ui.stream({ ...performed, outcome: "success" }, locatorLine);
    return undefined;
  }

  const actionName = `${built.action.type} on ${built.action.ref}`;
  const screen = await takeScreenAfterRefAction(ctx, resolved.runnerId);
  const written = screen.ok
    ? await writeActionScreenshot(
        ctx,
        {
          actionName,
          answer: performed,
          humanLead: locatorLine,
          imageJpegBase64: screen.imageJpegBase64,
          out: options.screenshot,
        },
        deps,
      )
    : {
        error: interactiveRunnerMessages.refActionScreenshotNotTaken(
          actionName,
          screen.detail,
        ),
        exitCode: exitCodes.network,
      };
  // The action took effect, so its locator is still the answer worth keeping.
  return written === undefined
    ? undefined
    : { ...written, error: `${locatorLine}\n${written.error}` };
}
