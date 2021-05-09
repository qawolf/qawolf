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

      // TODO notifyRunFinished
      console.log("run finished", result);
    })();
  }

  async before(): Promise<void> {
    // TODO notifyRunStarted
    console.log("run started");
  }
}
