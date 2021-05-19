import retry from "async-retry";
import axios from "axios";
import Debug from "debug";

import config from "../config";
import { Runner } from "../runner/Runner";
import { updateRunner } from "./api";

const debug = Debug("qawolf:StatusReporter");

export const ping = async (): Promise<void> => {
  await retry(async (_, attempt) => {
    debug("ping %s attempt %s", config.RUNNER_STATUS_URL, attempt);

    try {
      await axios.get(config.RUNNER_STATUS_URL);

      debug("ping success");
    } catch (e) {
      debug("ping failed %s", e.message);
      throw e;
    }
  });
};

export class StatusReporter {
  _lastUpdate = 0;
  _receivedRunId?: string;
  _runner: Runner;
  _updateInterval: NodeJS.Timeout | null = null;

  constructor(runner: Runner) {
    this._runner = runner;
    this._start();
  }

  async _start(): Promise<void> {
    if (!config.RUNNER_ID) {
      debug("QAWOLF_RUNNER_ID not set. Status reporting disabled.")
      return;
    }

    this._reportUpdate();

    this._updateInterval = global.setInterval(async () => {
      const updatePeriod = this._runner.progress() ? 30000 : 5000;
      if (Date.now() - this._lastUpdate < updatePeriod) return;

      await this._reportUpdate();
    }, 5000);
  }

  async _reportUpdate(): Promise<void> {
    await ping();

    const options =
      this._lastUpdate > 0
        ? { is_healthy: true }
        : { api_key: config.RUNNER_API_KEY, is_ready: true };

    const run = await updateRunner(options);
    this._lastUpdate = Date.now();

    if (run && this._receivedRunId !== run.id) {
      this._receivedRunId = run.id;

      debug(`run ${run.id}`);

      await this._runner.run({
        artifacts: run.artifacts,
        code: run.code,
        env: run.env,
        helpers: run.helpers,
        restart: true,
        run_id: run.id,
      });
    }
  }

  close(): void {
    debug("closed");
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }
}
