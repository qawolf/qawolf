import Debug from "debug";
import { EventEmitter } from "events";
import { without } from "lodash";
import { Browser } from "playwright";

import { CodeUpdater } from "../code/CodeUpdater";
import { Logger } from "../services/Logger";
import { RunHook, RunOptions, RunProgress, Variables } from "../types";
import { Run } from "./Run";
import { VM } from "./VM";

const debug = Debug("qawolf:Environment");

export class Environment extends EventEmitter {
  readonly _logger = new Logger();
  readonly _vm: VM;

  _browser?: Browser;
  _inProgress: Run[] = [];
  _variables: Variables = {};
  _updater = new CodeUpdater(this._variables);

  constructor() {
    super();

    this._logger.on("logscreated", (logs) => this.emit("logscreated", logs));

    this._updater.on("codeupdated", (update) =>
      this.emit("codeupdated", update)
    );

    this._vm = new VM({
      logger: this._logger,
      onLaunch: async (launched) => {
        this._browser = launched.browser;
        await this._updater.setContext(launched.context);
      },
    });

    debug("ready");
  }

  async close(): Promise<void> {
    debug("close");
    this._logger.close();
    this.removeAllListeners();
    await this._browser?.close();
  }

  get logger(): Logger {
    return this._logger;
  }

  get progress(): RunProgress | undefined {
    const run = this._inProgress.find((run) => !run.cancelled);
    return run?.progress;
  }

  async run(options: RunOptions, hooks: RunHook[] = []): Promise<void> {
    this._updater.disable();
    this._updater.updateCode(options);

    this._inProgress.forEach((runInProgress) => runInProgress.cancel());

    if (!options.cancel) {
      const run = new Run({
        runOptions: options,
        logger: this._logger,
        vm: this._vm,
      });

      this._inProgress.push(run);

      const emitRunProgress = (progress: RunProgress) =>
        this.emit("runprogress", progress);

      run.on("runprogress", emitRunProgress);

      await run.run(this._variables, hooks);

      run.off("runprogress", emitRunProgress);

      this._inProgress = without(this._inProgress, run);
    }

    if (options.cancel || this._inProgress.length === 0) {
      // enable code generation after there are no runs in progress
      await this._updater.enable();
    }
  }

  get updater(): CodeUpdater {
    return this._updater;
  }
}
