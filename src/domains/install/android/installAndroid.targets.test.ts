import { describe, expect, it } from "bun:test";

import { installAndroid } from "./index.js";
import { makeCtx, makeDeps, makeSpawn } from "./installAndroid.fixtures.js";

describe("installAndroid targets", () => {
  it("should create the any_phone AVD with the pixel_9 device id and the android-37.0 image", async () => {
    const { fn: spawn, calls } = makeSpawn();
    await installAndroid(makeCtx(), undefined, {
      ...makeDeps({ spawn, arch: "arm64" }),
      peekFlowMeta: async () => ({
        name: "F",
        target: "Android - Any Phone (Latest | Emulator)",
      }),
    });
    const createCall = calls.find(([, args]) => args[0] === "create");
    expect(createCall?.[1]).toEqual([
      "create",
      "avd",
      "-n",
      "qawolf_pixel_9_api37",
      "-k",
      "system-images;android-37.0;google_apis;arm64-v8a",
      "-d",
      "pixel_9",
      "--force",
    ]);
  });

  it("should create one AVD when an 'Any Phone' flow and a Pixel 9 flow share the API level", async () => {
    const { fn: spawn, calls } = makeSpawn();
    const targets: Record<string, string> = {
      "/a.ts": "Android - Any Phone (Android 16 | Emulator)",
      "/b.ts": "Android - Google Pixel 9 (Android 16 | Emulator)",
    };
    await installAndroid(makeCtx(), undefined, {
      ...makeDeps({ spawn, arch: "arm64" }),
      expandPatterns: async () => Object.keys(targets),
      peekFlowMeta: async (file) => ({ name: "F", target: targets[file] }),
    });
    const createCalls = calls.filter(([, args]) => args[0] === "create");
    expect(createCalls).toHaveLength(1);
    expect(createCalls[0]?.[1]).toContain("qawolf_pixel_9_api36");
  });

  it("should skip a physical Android phone target and log info when nothing else is Android", async () => {
    const ctx = makeCtx();
    const { fn: spawn, calls } = makeSpawn();
    const result = await installAndroid(ctx, undefined, {
      ...makeDeps({ spawn }),
      peekFlowMeta: async () => ({
        name: "Flow",
        target: "Android - Samsung Galaxy A17 (Android 16)",
      }),
    });
    expect(result).toBeUndefined();
    expect(ctx.ui.info).toHaveBeenCalledWith(
      "No Android flows found. Nothing to install.",
    );
    expect(calls).toHaveLength(0);
  });
});
