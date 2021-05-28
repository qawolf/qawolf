import { EventEmitter } from "events";

import { FileModel } from "../code/FileModel";
import { Environment } from "../environment/Environment";
import { Log } from "../services/Logger";
import {
  CodeUpdate,
  ElementChooserValue,
  RunHook,
  RunOptions,
  RunProgress,
} from "../types";
import { LogArtifactHook } from "./LogArtifactHook";
import { StatusReporterHook } from "./StatusReporterHook";
import { VideoArtifactsHook } from "./VideoArtifactsHook";

export const createHooks = (
  options: RunOptions,
  environment: Environment
): RunHook[] => {
  const hooks: RunHook[] = [];

  let videoArtifactsHook: VideoArtifactsHook | undefined;

  if (options.artifacts) {
    hooks.push(new LogArtifactHook(options.artifacts, environment.logger));
    videoArtifactsHook = new VideoArtifactsHook(options.artifacts);
    hooks.push(videoArtifactsHook);
  }

  if (options.run_id) {
    hooks.push(new StatusReporterHook(options.run_id, videoArtifactsHook));
  }

  return hooks;
};

export class Runner extends EventEmitter {
  _environment?: Environment;
  _hooks: RunHook[] = [];
  _testModel = new FileModel();

  async _createEnvironment(): Promise<Environment> {
    await this._environment?.close();

    const environment = new Environment({ testModel: this._testModel });

    // reset the logs when a new environment is created
    this.emit("logs", environment.logger.logs);

    environment.on("elementchooser", (event: ElementChooserValue) =>
      this.emit("elementchooser", event)
    );

    environment.on("logscreated", (logs: Log[]) =>
      this.emit("logscreated", logs)
    );

    environment.on("runprogress", (progress: RunProgress) =>
      this.emit("runprogress", progress)
    );

    this._environment = environment;

    return environment;
  }

  async close(): Promise<void> {
    await this._environment?.close();
  }

  get logs(): Log[] {
    return this._environment?.logger.logs || [];
  }

  // not a getter so it can be mocked
  progress(): RunProgress | undefined {
    return this._environment?.progress;
  }

  async run(options: RunOptions): Promise<void> {
    this._hooks = [];

    if (!this._environment || options.restart) {
      this._environment = await this._createEnvironment();
      // create new hooks for restarted runs
      this._hooks = createHooks(options, this._environment);
    }

    await this._environment.run(options, this._hooks);
  }

  async startElementChooser(): Promise<void> {
    this._environment?.updater.disable();
    await this._environment?.elementChooser.start();
  }

  async stop(): Promise<void> {
    await this._environment?.stop();
  }

  async stopElementChooser(): Promise<void> {
    // run both immediately instead of waiting to enable
    // otherwise a subsequent updater.disable could be overridden
    // by our delayed updater.enable call
    await Promise.all([
      this._environment?.elementChooser.stop(),
      this._environment?.updater.enable(),
    ]);
  }

  get testModel(): FileModel {
    return this._testModel;
  }
}
