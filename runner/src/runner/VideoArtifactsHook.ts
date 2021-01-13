/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Debug from "debug";
import { intersection, noop } from "lodash";

import { uploadFile } from "../services/aws";
import { VideoCapture } from "../services/VideoCapture";
import { Artifacts } from "../types";

const debug = Debug("qawolf:VideoArtifactsHook");

const REQUIRED_KEYS = ["gifUrl", "videoUrl"];

export class VideoArtifactsHook {
  _artifacts: Artifacts;
  _onUploaded: () => void = noop;
  _skip: boolean;
  _uploadedPromise = new Promise<void>((resolve) => {
    this._onUploaded = resolve;
  });
  _videoCapture = new VideoCapture();

  constructor(artifacts: Artifacts) {
    this._artifacts = artifacts;

    const hasRequiredKeys =
      intersection(Object.keys(artifacts), REQUIRED_KEYS).length ===
      REQUIRED_KEYS.length;
    this._skip = !hasRequiredKeys;
  }

  async after(): Promise<void> {
    if (this._skip) return;

    await this._videoCapture.stop();

    const { gifUrl, videoUrl } = this._artifacts;

    const videoUploadedPromise = uploadFile({
      savePath: this._videoCapture.videoPath,
      url: videoUrl!,
    });

    this._videoCapture.createGif().then(async () => {
      await uploadFile({
        savePath: this._videoCapture.gifPath,
        url: gifUrl!,
      });

      await videoUploadedPromise;

      this._onUploaded();
    });
  }

  async before(): Promise<void> {
    if (this._skip) return;

    await this._videoCapture.start();
  }

  async waitForUpload(): Promise<void> {
    if (this._skip) return;

    await this._uploadedPromise;

    debug("video and gif uploaded");
  }
}
