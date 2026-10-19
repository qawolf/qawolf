import type { publicContractsV1 } from "@qawolf/api-contracts/v1";
import type { z } from "zod";

import { interactiveRunnerMessages } from "~/core/messages/index.js";
import type { CommandResult } from "~/shell/commandContext.js";
import { exitCodes } from "~/shell/exit.js";

type SnapshotFailureReason = Extract<
  z.output<typeof publicContractsV1.runner.snapshotPage.output>,
  { outcome: "failure" }
>["failureReason"];

type RefActionFailure = Extract<
  z.output<typeof publicContractsV1.runner.performRefAction.output>,
  { outcome: "failure" }
>;

/** Why a page could not be read, and what the caller should do about it. */
export function describeSnapshotFailure(
  failureReason: SnapshotFailureReason,
): Exclude<CommandResult, void> {
  switch (failureReason) {
    case "no-page":
      return {
        error: interactiveRunnerMessages.pageSnapshotNoPage,
        exitCode: exitCodes.invalidArgs,
      };
    case "no-answer":
      return {
        error: interactiveRunnerMessages.pageSnapshotNoAnswer,
        exitCode: exitCodes.network,
      };
    case "page-snapshots-not-enabled":
      return {
        error: interactiveRunnerMessages.pageSnapshotsNotEnabled,
        exitCode: exitCodes.invalidArgs,
      };
    case "runner-cannot-snapshot-pages":
      return {
        error: interactiveRunnerMessages.runnerCannotSnapshotPages,
        exitCode: exitCodes.invalidArgs,
      };
    case "runner-unreachable":
      return {
        error: interactiveRunnerMessages.runnerUnreachable,
        exitCode: exitCodes.network,
      };
    default:
      failureReason satisfies never;
      return {
        error:
          interactiveRunnerMessages.pageSnapshotAnsweredUnknown(failureReason),
        exitCode: exitCodes.network,
      };
  }
}

/** Why a ref action was refused, and what the caller should do about it. */
export function describeRefActionFailure(options: {
  failure: RefActionFailure;
  ref: string;
}): Exclude<CommandResult, void> {
  const { failure, ref } = options;
  const { failureReason } = failure;
  switch (failureReason) {
    // Attempted and did not take effect, which is an answer rather than a fault.
    case "action-failed":
      return {
        error: interactiveRunnerMessages.refActionFailed(
          failure.errorMessage,
          failure.locator,
        ),
        exitCode: exitCodes.testFailure,
      };
    case "ref-not-found":
      return {
        error: interactiveRunnerMessages.refNotFound(ref),
        exitCode: exitCodes.invalidArgs,
      };
    // The action may have landed before the answer was lost.
    case "runner-unreachable":
      return {
        error: interactiveRunnerMessages.actionMayHaveHappened,
        exitCode: exitCodes.network,
      };
    case "no-answer":
    case "no-page":
    case "page-snapshots-not-enabled":
    case "runner-cannot-snapshot-pages":
      return describeSnapshotFailure(failureReason);
    default:
      failureReason satisfies never;
      return {
        error:
          interactiveRunnerMessages.pageSnapshotAnsweredUnknown(failureReason),
        exitCode: exitCodes.network,
      };
  }
}
