import { type Command, CommanderError } from "commander";
import { describe, expect, it } from "bun:test";

import { getCommandKind } from "~/commands/commandKind.js";
import { createProgram } from "~/commands/program.js";
import { makeNoopSignals } from "~/shell/signals/createSignalRegistry.fixtures.js";

function find(parent: Command, name: string): Command {
  const command = parent.commands.find((child) => child.name() === name);
  if (!command) throw Error(`Missing command ${name}`);
  return command;
}

async function parse(verb: string, args: string[]) {
  const program = createProgram({ signals: makeNoopSignals() });
  const command = find(find(program, "runner"), verb);
  let parsed: unknown;
  command
    .exitOverride()
    .configureOutput({ writeErr: () => {}, writeOut: () => {} });
  // Capture real Commander argument/option placement without authenticating.
  command.action((...values: unknown[]) => {
    parsed = values.slice(0, -1);
  });
  await program.parseAsync(["runner", verb, ...args], { from: "user" });
  return parsed;
}

describe("page snapshot command arguments", () => {
  it("parses snapshot's --interactive flag", async () => {
    expect(
      await parse("snapshot", ["--interactive", "--runner", "ci"]),
    ).toEqual([{ interactive: true, runner: "ci" }]);
  });

  it("parses a ref action's values separately from its flags", async () => {
    expect(
      await parse("ref", [
        "select",
        "e9",
        "Canada",
        "Mexico",
        "--screenshot",
        "after.jpg",
      ]),
    ).toEqual([
      "select",
      "e9",
      ["Canada", "Mexico"],
      { screenshot: "after.jpg" },
    ]);
  });

  it("refuses a ref action it does not have", async () => {
    expect(parse("ref", ["press", "e4"])).rejects.toMatchObject({
      code: "commander.invalidArgument",
    });
  });

  it("requires a ref", async () => {
    expect(parse("ref", ["click"])).rejects.toBeInstanceOf(CommanderError);
  });

  it("classifies snapshot as a read and ref as a write", () => {
    const runner = find(
      createProgram({ signals: makeNoopSignals() }),
      "runner",
    );
    expect(getCommandKind(find(runner, "snapshot"))?.kind).toBe("read");
    expect(getCommandKind(find(runner, "ref"))?.kind).toBe("write");
  });
});
