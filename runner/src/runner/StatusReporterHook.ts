import { notifyRunFinished, notifyRunStarted } from "../services/api";
import { RunHook, RunProgress } from "../types";
import { VideoArtifactsHook } from "./VideoArtifactsHook";

export class StatusReporterHook implements RunHook {
  _runId: string;
  _videoCaptureHook: VideoArtifactsHook | undefined;

  constructor(run_id: string, videoCaptureHook?: VideoArtifactsHook) {
    this._runId = run_id;
    this._videoCaptureHook = videoCaptureHook;
  }

  async after(result: RunProgress): Promise<void> {
    (async () => {
      if (this._videoCaptureHook) {
        await this._videoCaptureHook.waitForUpload();
      }

      await notifyRunFinished({
        current_line: result.current_line,
        pass: result.status === "pass",
        run_id: this._runId,
      });
    })();
  }

  async before(): Promise<void> {
    notifyRunStarted({ run_id: this._runId });
  }
}
