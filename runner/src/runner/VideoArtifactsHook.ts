/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Debug from "debug";
import { RunHook, RunProgress } from "../types";
import { intersection, noop } from "lodash";

import { uploadFile } from "../services/aws";
import { VideoCapture } from "../services/VideoCapture";
import { Artifacts } from "../types";

const debug = Debug("qawolf:VideoArtifactsHook");

const REQUIRED_KEYS = ["gifUrl", "videoUrl"];

export class VideoArtifactsHook implements RunHook {
  _artifacts: Artifacts;
  _onUploaded: () => void = noop;
  _skip: boolean;
  _uploadedPromise = new Promise<void>((resolve) => {
    this._onUploaded = resolve;
  });
  _videoCapture = new VideoCapture();

  constructor(artifacts: Artifacts) {
    this._artifacts = artifacts;

    // To skip upload of either URL but enable recording (primarily for
    // testing), the URL string can be set to "local-only". Note that
    // both URLs must be supplied either way, or `_skip` will be true
    // and no recording will happen.
    const hasRequiredKeys =
      intersection(Object.keys(artifacts), REQUIRED_KEYS).length ===
      REQUIRED_KEYS.length;
    this._skip = !hasRequiredKeys;
  }

  async after(): Promise<void> {
    if (this._skip) return;

    await this._videoCapture.stop();

    const { gifUrl, videoUrl } = this._artifacts;

    const promises = [];

    if (videoUrl !== "local-only") {
      promises.push(
        uploadFile({
          savePath: this._videoCapture.videoWithMetadataPath,
          url: videoUrl!,
        })
      );
    }

    if (gifUrl !== "local-only") {
      promises.push(
        (async () => {
          await this._videoCapture.createGif();
          await uploadFile({
            savePath: this._videoCapture.gifPath,
            url: gifUrl!,
          });
        })()
      );
    }

    // Upload video file and create and upload GIF in parallel
    await Promise.all(promises);

    this._onUploaded();
  }

  async before(): Promise<void> {
    if (this._skip) return;

    await this._videoCapture.start();
  }

  async progress(progress: RunProgress): Promise<void> {
    if (this._skip) return;

    const lineNum = progress.current_line;
    const lineCode = progress.code.split("\n")[lineNum - 1];

    this._videoCapture.markChapter(lineNum, lineCode);
  }

  async waitForUpload(): Promise<void> {
    if (this._skip) return;

    await this._uploadedPromise;

    debug("video and gif uploaded");
  }
}
