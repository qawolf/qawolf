import type { Command } from "commander";
import { describe, expect, it } from "bun:test";

import { createProgram } from "~/commands/program.js";
import { makeNoopSignals } from "~/shell/signals/createSignalRegistry.fixtures.js";

function find(parent: Command, name: string): Command {
  const command = parent.commands.find((child) => child.name() === name);
  if (!command) throw Error(`Missing command ${name}`);
  return command;
}

async function parseOptions(args: string[]) {
  const program = createProgram({ signals: makeNoopSignals() });
  const command = find(find(program, "runner"), "run");
  let options: unknown;
  command
    .exitOverride()
    .configureOutput({ writeErr: () => {}, writeOut: () => {} });
  // Capture real Commander option parsing without authenticating.
  command.action((_flowFile: string, opts: unknown) => {
    options = opts;
  });
  await program.parseAsync(["runner", "run", "flows/a.flow.ts", ...args], {
    from: "user",
  });
  return options;
}

describe("runner run variable flags", () => {
  it("collects --env-var and its --var alias into one list, in order", async () => {
    expect(
      await parseOptions([
        "--env-var",
        "RUN_INPUT_PATH=uploads/app.apk",
        "--var",
        "BASE_URL=https://x.test",
      ]),
    ).toMatchObject({
      envVar: ["RUN_INPUT_PATH=uploads/app.apk", "BASE_URL=https://x.test"],
    });
  });
});
