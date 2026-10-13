import { mock } from "bun:test";
import { join } from "node:path";

import type { SpawnFn, SpawnResult } from "~/shell/spawn.js";
import type { CommandContext } from "~/shell/commandContext.js";

export const sdk = "/sdk";
export const binDir = join(sdk, "cmdline-tools", "latest", "bin");
export const sdkManagerPath = join(binDir, "sdkmanager");
export const appiumBinPath = join("/cwd", "node_modules", ".bin", "appium");

export const success: SpawnResult = { exitCode: 0, stdout: "", stderr: "" };

export function makeSpawn(overrides: Record<string, SpawnResult> = {}): {
  fn: SpawnFn;
  calls: Parameters<SpawnFn>[];
} {
  const calls: Parameters<SpawnFn>[] = [];
  const fn: SpawnFn = (cmd, args, opts) => {
    calls.push([cmd, args, opts]);
    const key = args[0] ?? cmd;
    return Promise.resolve(overrides[key] ?? success);
  };
  return { fn, calls };
}

export function makeCtx(): CommandContext {
  return {
    ui: {
      step: mock(() => {}),
      info: mock(() => {}),
      success: mock(() => {}),
      error: mock(() => {}),
      warn: mock(() => {}),
    },
    configDir: "/tmp",
    outputMode: "human",
    isInteractive: false,
    apiBaseUrl: "https://app.qawolf.com",
  } as unknown as CommandContext;
}

export function makeDeps(
  overrides: {
    spawn?: SpawnFn;
    peekFlowMeta?: (
      f: string,
    ) => Promise<{ name: string | undefined; target: string | undefined }>;
    arch?: NodeJS.Architecture;
    expandPatterns?: () => Promise<string[]>;
    checkExists?: (path: string) => boolean;
  } = {},
) {
  return {
    cwd: "/cwd",
    spawn: overrides.spawn ?? makeSpawn().fn,
    arch: overrides.arch ?? "arm64",
    androidHome: sdk,
    // Runtime deps are installed; no AVD or license file exists yet.
    checkExists:
      overrides.checkExists ?? ((path: string) => path.includes(".bin")),
    platform: "linux" as NodeJS.Platform,
    expandPatterns: overrides.expandPatterns ?? (async () => ["/flow.ts"]),
    peekFlowMeta:
      overrides.peekFlowMeta ??
      (async () => ({
        name: "Flow",
        target: "Android - Pixel 9 (Android 15)",
      })),
    resolveDepsRoot: async () => "/cwd",
  };
}
