/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Debug from "debug";
import { noop } from "lodash";

import { uploadFile } from "../services/aws";
import { VideoCapture } from "../services/VideoCapture";
import { RunHook, RunProgress } from "../types";
import { Artifacts } from "../types";

const debug = Debug("qawolf:VideoArtifactsHook");

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

    // To skip capturing, do not supply a gif or video url.
    // To skip upload of either URL but enable recording (primarily for
    // testing), the URL string can be set to "local-only".
    this._skip =
      !this._artifacts.gifUrl &&
      !this._artifacts.jsonUrl &&
      !this._artifacts.videoUrl;
  }

  async after(): Promise<void> {
    if (this._skip) return;

    await this._videoCapture.stop();

    const { gifUrl, jsonUrl, videoUrl } = this._artifacts;

    const promises = [];

    if (videoUrl && videoUrl !== "local-only") {
      promises.push(
        uploadFile({
          savePath: this._videoCapture.videoPath,
          url: videoUrl!,
        })
      );
    }

    if (gifUrl) {
      promises.push(
        (async () => {
          await this._videoCapture.createGif();

          if (gifUrl !== "local-only") {
            await uploadFile({
              savePath: this._videoCapture.gifPath,
              url: gifUrl!,
            });
          }
        })()
      );
    }

    if (jsonUrl) {
      promises.push(
        (async () => {
          await this._videoCapture.createMetadataJson();

          if (jsonUrl !== "local-only") {
            await uploadFile({
              savePath: this._videoCapture.jsonPath,
              url: jsonUrl!,
            });
          }
        })()
      );
    }

    // Upload video file and create and upload GIF and JSON in parallel
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

    this._videoCapture.markLine(lineNum, lineCode);
  }

  async waitForUpload(): Promise<void> {
    if (this._skip) return;

    await this._uploadedPromise;

    debug("video and related assets uploaded");
  }
}
