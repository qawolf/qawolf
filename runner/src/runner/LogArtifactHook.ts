import { uploadFile } from "../services/aws";
import { Logger } from "../services/Logger";
import { Artifacts, RunHook } from "../types";

export class LogArtifactHook implements RunHook {
  _artifacts: Artifacts;
  _logger: Logger;

  constructor(artifacts: Artifacts, logger: Logger) {
    this._artifacts = artifacts;
    this._logger = logger;
  }

  async after(): Promise<void> {
    const { logsUrl } = this._artifacts;

    // Can set to "local-only" to skip upload when running tests
    if (logsUrl !== "local-only") {
      await uploadFile({
        data: JSON.stringify(this._logger.logs),
        url: logsUrl,
      });
    }
  }
}
