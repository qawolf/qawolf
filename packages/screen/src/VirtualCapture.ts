import { logger } from "@qawolf/logger";
import { platform } from "os";
import { join } from "path";
import { createGif } from "./createGif";
import { Offset, Size } from "./types";
import { VideoCapture, VideoCaptureOptions } from "./VideoCapture";
import { Xvfb } from "./Xvfb";

interface CreateOptions {
  offset?: Offset;
  savePath: string;
  size: Size;
}

const makeEven = (x: number) => Math.ceil(x / 2) * 2;

export class VirtualCapture {
  private _options: VideoCaptureOptions;
  private _gifPath: string;
  private _videoCapture: VideoCapture | null;
  private _videoPath: string;

  protected constructor(options: VideoCaptureOptions) {
    this._options = options;
  }

  static async create(options: CreateOptions) {
    if (platform() !== "linux") {
      logger.info("video capture disabled: only linux is supported currently");
      return null;
    }

    const offset = options.offset || { x: 0, y: 0 };

    // ffmpeg video size must be divisible by 2
    const videoSize = {
      height: makeEven(options.size.height),
      width: makeEven(options.size.width)
    };

    const displaySize = {
      height: videoSize.height + offset.y,
      width: videoSize.width + offset.x
    };

    const xvfb = await Xvfb.start(displaySize);
    if (!xvfb) return null;

    return new VirtualCapture({
      offset,
      savePath: options.savePath,
      size: videoSize,
      xvfb
    });
  }

  public get gifPath() {
    return this._gifPath;
  }

  public get size() {
    return this._options.size;
  }

  public get stopped() {
    return this._videoCapture && this._videoCapture.stopped;
  }

  public get videoPath() {
    return this._videoPath;
  }

  public get xvfb() {
    return this._options.xvfb;
  }

  public async start() {
    const startedAt = Date.now();
    this._gifPath = join(this._options.savePath, `video_${startedAt}.gif`);
    this._videoPath = join(this._options.savePath, `video_${startedAt}.mp4`);

    this._videoCapture = await VideoCapture.start({
      ...this._options,
      savePath: this._videoPath
    });
  }

  public async stop() {
    if (this._videoCapture) {
      await this._videoCapture.stop();

      await createGif({
        gifPath: this._gifPath,
        size: this._options.size,
        videoPath: this._videoPath
      });
    }

    await this._options.xvfb.stop();
  }
}
