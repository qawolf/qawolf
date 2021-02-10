import { EventEmitter } from "events";

import { Logger } from "../services/Logger";
import { RunHook, RunOptions, RunProgress, Variables } from "../types";
import { VM } from "./VM";

type RunConstructorOptions = {
  logger: Logger;
  runOptions: RunOptions;
  vm: VM;
};

export class Run extends EventEmitter {
  _logger: Logger;
  _progress: RunProgress;
  _runOptions: RunOptions;
  _stopped = false;
  _vm: VM;

  constructor({ runOptions, logger, vm }: RunConstructorOptions) {
    super();
    this._logger = logger;
    this._runOptions = runOptions;
    this._vm = vm;

    this._progress = {
      code: runOptions.code,
      completed_at: null,
      // default the current line to the start line
      // in case the script fails before running any lines
      current_line: runOptions.start_line || 1,
      run_id: runOptions.run_id,
      start_line: runOptions.start_line,
      status: "created",
      test_id: runOptions.test_id,
    };
  }

  _emitProgress(): void {
    if (this._stopped) return;
    this.emit("runprogress", this.progress);
  }

  _onLineStarted(line: number): boolean {
    if (this._stopped) {
      console.error("skip remaining lines since run is stopped");
      return false;
    }

    this._progress.current_line = line;
    this._emitProgress();
    return true;
  }

  get progress(): RunProgress {
    // clone the current progress
    return { ...this._progress };
  }

  async run(variables: Variables, hooks: RunHook[]): Promise<void> {
    try {
      this._stopped = false;
      await Promise.all(hooks.map((hook) => hook.before && hook.before()));

      if (this._runOptions.env) this._vm.setEnv(this._runOptions.env);

      await this._vm.run({
        code: this._progress.code,
        endLine: this._runOptions.end_line,
        helpers: this._runOptions.helpers,
        onLineStarted: this._onLineStarted.bind(this),
        startLine: this._runOptions.start_line,
        variables,
      });

      this._progress.status = "pass";
    } catch (e) {
      this._progress.error = formatError(e);
      this._logger.log("qawolf", "error", this._progress.error);
      this._progress.status = "fail";
    }

    this._progress.completed_at = new Date().toISOString();
    this._emitProgress();

    await Promise.all(
      hooks.map((hook) => hook.after && hook.after(this.progress))
    );
  }

  stop(): void {
    this._stopped = true;
  }

  get stopped(): boolean {
    return this._stopped;
  }
}

export const formatError = (e: Error): string => {
  const lines = (e.stack as string).split("\n");

  const systemStackIndex =
    lines.findIndex((line) => line.includes("qawolfTest")) + 1;

  if (systemStackIndex < 1) {
    return lines.join("\n");
  }
  // only include user stack
  return lines.slice(0, systemStackIndex).join("\n");
};
