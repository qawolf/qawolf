import { EventEmitter } from "events";

import { Environment } from "../environment/Environment";
import { Log } from "../services/Logger";
import { CodeUpdate, RunHook, RunOptions, RunProgress } from "../types";
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

  constructor() {
    super();
  }

  async _createEnvironment(): Promise<Environment> {
    await this._environment?.close();

    const environment = new Environment();

    // reset the logs when a new environment is created
    this.emit("logs", environment.logger.logs);

    environment.on("codeupdated", (update: CodeUpdate) =>
      this.emit("codeupdated", update)
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
    let hooks: RunHook[] = [];

    if (!this._environment || options.restart) {
      this._environment = await this._createEnvironment();
      // create hooks for fresh runs
      hooks = createHooks(options, this._environment);
    }

    await this._environment.run(options, hooks);
  }

  async stop(): Promise<void> {
    await this._environment?.stop();
  }

  updateCode(update: CodeUpdate): boolean {
    const updated = this._environment?.updater.updateCode(update);
    return !!updated;
  }
}
