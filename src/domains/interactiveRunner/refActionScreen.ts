import { publicContractsV1 } from "@qawolf/api-contracts/v1";

import type { AuthCommandContext } from "~/shell/commandContext.js";
import { failureFields } from "~/shell/platform/requestWithRetry.js";

import { runnerCallOptions } from "./runnerCallOptions.js";

/**
 * Takes the runner's screen right after a ref action. A ref action does not
 * answer with a screen of its own, so this is the second call `--screenshot`
 * makes in its place.
 */
export async function takeScreenAfterRefAction(
  ctx: AuthCommandContext,
  runnerId: string,
): Promise<
  { ok: true; imageJpegBase64: string } | { ok: false; detail: string }
> {
  const result = await ctx.platformClient.callPublicApi(
    publicContractsV1.runner.takeScreenshot,
    { id: runnerId },
    runnerCallOptions,
  );
  if (!result.ok) return { detail: failureFields(result).error, ok: false };
  if (result.value.outcome === "failure") {
    return {
      detail: `the runner answered ${result.value.failureReason}`,
      ok: false,
    };
  }
  return { imageJpegBase64: result.value.imageJpegBase64, ok: true };
}
