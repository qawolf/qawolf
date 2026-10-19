import { Argument, type Command } from "commander";

import { declareCommandKind } from "~/commands/commandKind.js";
import { withAuthContext } from "~/commands/context.js";
import { refVerbs } from "~/core/interactiveRunner/refAction.js";
import { handleRunnerRefAction } from "~/domains/interactiveRunner/performRefAction.js";
import { handleRunnerSnapshotPage } from "~/domains/interactiveRunner/snapshotPage.js";
import type { SignalRegistry } from "~/shell/signals/createSignalRegistry.js";

import { runnerDeps, runnerFlagDescription } from "./context.js";
import { runnerGuides } from "./guides/index.js";

const snapshotExamples = `
Examples:
  $ qawolf runner snapshot
  $ qawolf runner snapshot --interactive`;

const refExamples = `
Examples:
  $ qawolf runner ref click e4
  $ qawolf runner ref fill e7 "hello@example.com" --screenshot after.jpg
  $ qawolf runner ref select e9 "Canada"
  $ qawolf runner ref dblclick e12`;

export function registerRunnerPageSnapshotCommands(
  runner: Command,
  signals: SignalRegistry,
): void {
  declareCommandKind(runner.command("snapshot"), "read")
    .description(
      "Print the accessibility outline of a runner's page, with a ref such as e4 on each element for qawolf runner ref to act on",
    )
    .option(
      "--interactive",
      "Keep only the elements a user can act on, one per line",
    )
    .option("--runner <id>", runnerFlagDescription)
    .addHelpText("after", snapshotExamples)
    .addHelpText("after", runnerGuides.snapshot)
    .action(
      (opts: { interactive?: boolean; runner?: string }, command: Command) =>
        withAuthContext(signals, (ctx) =>
          handleRunnerSnapshotPage(
            ctx,
            {
              interactiveOnly: opts.interactive === true,
              runner: opts.runner,
            },
            runnerDeps(ctx),
          ),
        )(opts, command),
    );

  declareCommandKind(runner.command("ref"), "write")
    .description(
      "Act on the element a ref from qawolf runner snapshot names, and print its Playwright locator. fill takes the text; select takes one or more option values or labels",
    )
    .addArgument(
      new Argument("<action>", "What to do to the element").choices([
        ...refVerbs,
      ]),
    )
    .argument("<ref>", "A ref from the latest snapshot, such as e4")
    .argument("[value...]", "fill: the text. select: the options to select")
    .option("--runner <id>", runnerFlagDescription)
    .option(
      "--screenshot <path>",
      "Also save a JPEG of the screen, taken after the action, to this file. - writes it to stdout and moves the confirmation, JSON included, to stderr",
    )
    .addHelpText("after", refExamples)
    .addHelpText("after", runnerGuides.ref)
    .action(
      (
        verb: string,
        ref: string,
        values: string[],
        opts: { runner?: string; screenshot?: string },
        command: Command,
      ) =>
        withAuthContext(signals, (ctx) =>
          handleRunnerRefAction(
            ctx,
            {
              ref,
              runner: opts.runner,
              screenshot: opts.screenshot,
              values,
              verb,
            },
            runnerDeps(ctx),
          ),
        )(opts, command),
    );
}
