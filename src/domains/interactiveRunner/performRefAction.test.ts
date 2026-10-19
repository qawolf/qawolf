import { publicContractsV1 } from "@qawolf/api-contracts/v1";
import { describe, expect, it } from "bun:test";

import { makeAuthCtx, makeTestDeps } from "./deps.testUtils.js";
import { handleRunnerRefAction } from "./performRefAction.js";
import { runnerCallOptions } from "./runnerCallOptions.js";

const jpegBytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const imageJpegBase64 = Buffer.from(jpegBytes).toString("base64");
const locator = "page.getByRole('button', { name: 'Save' })";

const refAction = (
  verb: string,
  values: string[] = [],
  screenshot?: string,
) => ({ ref: "e4", runner: "ci", screenshot, values, verb });

describe("handleRunnerRefAction", () => {
  it.each([
    ["click", [], { ref: "e4", type: "click" }],
    ["dblclick", [], { ref: "e4", type: "double-click" }],
    ["hover", [], { ref: "e4", type: "hover" }],
    ["fill", ["hello"], { ref: "e4", text: "hello", type: "fill" }],
    ["select", ["a", "b"], { ref: "e4", type: "select", values: ["a", "b"] }],
  ])("sends %s and prints the locator", async (verb, values, action) => {
    const { callPublicApi, ctx, streamed } = makeAuthCtx();
    callPublicApi.mockResolvedValue({
      ok: true,
      value: { locator, outcome: "success" },
    });

    expect(
      await handleRunnerRefAction(ctx, refAction(verb, values), makeTestDeps()),
    ).toBeUndefined();

    expect(callPublicApi).toHaveBeenCalledWith(
      publicContractsV1.runner.performRefAction,
      { action, id: "ci" },
      runnerCallOptions,
    );
    expect(streamed()).toEqual([`locator: ${locator}`]);
  });

  it.each([
    ["fill", []],
    ["fill", ["a", "b"]],
    ["select", []],
    ["click", ["extra"]],
  ])("refuses %s with %p before calling the runner", async (verb, values) => {
    const { callPublicApi, ctx } = makeAuthCtx();

    const result = await handleRunnerRefAction(
      ctx,
      refAction(verb, values),
      makeTestDeps(),
    );

    expect(result?.exitCode).toBe(2);
    expect(callPublicApi).not.toHaveBeenCalled();
  });

  it("points at a fresh snapshot when the ref is gone", async () => {
    const { callPublicApi, ctx } = makeAuthCtx();
    callPublicApi.mockResolvedValue({
      ok: true,
      value: { failureReason: "ref-not-found", outcome: "failure" },
    });

    const result = await handleRunnerRefAction(
      ctx,
      refAction("click"),
      makeTestDeps(),
    );

    expect(result?.exitCode).toBe(2);
    expect(result?.error).toContain("qawolf runner snapshot");
  });

  it("prints the error and the locator when the action did not complete", async () => {
    const { callPublicApi, ctx } = makeAuthCtx();
    callPublicApi.mockResolvedValue({
      ok: true,
      value: {
        errorMessage: "element is covered",
        failureReason: "action-failed",
        locator,
        outcome: "failure",
      },
    });

    const result = await handleRunnerRefAction(
      ctx,
      refAction("click"),
      makeTestDeps(),
    );

    expect(result?.exitCode).toBe(1);
    expect(result?.error).toContain("element is covered");
    expect(result?.error).toContain(`locator: ${locator}`);
  });

  it("takes the screen after the action and writes it with the locator", async () => {
    const { callPublicApi, ctx, outputs } = makeAuthCtx("json");
    callPublicApi
      .mockResolvedValueOnce({
        ok: true,
        value: { locator, outcome: "success" },
      })
      .mockResolvedValueOnce({
        ok: true,
        value: { imageJpegBase64, outcome: "success" },
      });
    const deps = makeTestDeps();

    expect(
      await handleRunnerRefAction(
        ctx,
        refAction("click", [], "after.jpg"),
        deps,
      ),
    ).toBeUndefined();

    expect(callPublicApi.mock.calls[1]?.[0]).toBe(
      publicContractsV1.runner.takeScreenshot,
    );
    expect(deps.written).toEqual([{ bytes: jpegBytes, path: "after.jpg" }]);
    expect(outputs()[0]?.data).toEqual({
      action: { ref: "e4", type: "click" },
      locator,
      outcome: "success",
      screenshotPath: "after.jpg",
    });
  });

  it("keeps the locator when the screen after the action cannot be taken", async () => {
    const { callPublicApi, ctx } = makeAuthCtx("json");
    callPublicApi
      .mockResolvedValueOnce({
        ok: true,
        value: { locator, outcome: "success" },
      })
      .mockResolvedValueOnce({
        ok: true,
        value: { failureReason: "screen-not-ready", outcome: "failure" },
      });

    const result = await handleRunnerRefAction(
      ctx,
      refAction("click", [], "after.jpg"),
      makeTestDeps(),
    );

    expect(result?.exitCode).toBe(4);
    expect(result?.error).toContain(`locator: ${locator}`);
    expect(result?.error).toContain("do not repeat it");
  });
});
