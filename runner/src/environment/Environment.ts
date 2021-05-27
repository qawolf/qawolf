import Debug from "debug";
import { EventEmitter } from "events";
import { without } from "lodash";
import { Browser } from "playwright";

import { FileModel } from "../code/FileModel";
import { CodeUpdater } from "../code/CodeUpdater";
import { Logger } from "../services/Logger";
import { RunHook, RunOptions, RunProgress, Variables } from "../types";
import { ElementChooser } from "./ElementChooser";
import { Run } from "./Run";
import { VM } from "./VM";

const debug = Debug("qawolf:Environment");

type EnvironmentOptions = {
  testModel: FileModel;
  logger?: Logger;
};

export class Environment extends EventEmitter {
  readonly _logger: Logger;
  readonly _vm: VM;

  _browser?: Browser;
  _elementChooser = new ElementChooser();
  _inProgress: Run[] = [];
  _variables: Variables = {};
  _updater: CodeUpdater;

  constructor({ logger, testModel }: EnvironmentOptions) {
    super();

    this._logger = logger || new Logger();

    this._updater = new CodeUpdater({ testModel, variables: this._variables });

    this._elementChooser.on("elementchooser", (event) =>
      this.emit("elementchooser", event)
    );

    this._logger.on("logscreated", (logs) => this.emit("logscreated", logs));

    this._vm = new VM({
      logger: this._logger,
      onLaunch: async (launched) => {
        this._browser = launched.browser;
        await Promise.all([
          this._elementChooser.setContext(launched.context),
          this._updater.setContext(launched.context),
        ]);
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

  get elementChooser(): ElementChooser {
    return this._elementChooser;
  }

  get logger(): Logger {
    return this._logger;
  }

  get progress(): RunProgress | undefined {
    const run = this._inProgress.find((run) => !run.stopped);
    return run?.progress;
  }

  async run(options: RunOptions, hooks: RunHook[] = []): Promise<void> {
    this._updater.disable();

    this._inProgress.forEach((runInProgress) => runInProgress.stop());

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

    if (this._inProgress.length === 0) {
      // enable code generation after there are no runs in progress
      await this._updater.enable();
    }
  }

  async stop(): Promise<void> {
    this._inProgress.forEach((run) => run.stop());
    this._inProgress = [];
    await this._updater.enable();
  }

  get updater(): CodeUpdater {
    return this._updater;
  }
}
