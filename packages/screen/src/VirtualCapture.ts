import "./CiInfoTypes";
import { isCI } from "@qawolf/ci-info";
import { platform } from "os";
import { join } from "path";
import { createGif } from "./createGif";
import { Display } from "./Display";
import { Offset, Size } from "./types";
import { VideoCapture, VideoCaptureOptions } from "./VideoCapture";

interface CreateOptions {
  offset: Offset;
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
    if (!this.isEnabled()) return null;

    // ffmpeg video size must be divisible by 2
    const videoSize = {
      height: makeEven(options.size.height),
      width: makeEven(options.size.width)
    };

    const displaySize = {
      height: videoSize.height + options.offset.y,
      width: videoSize.width + options.offset.x
    };

    const display = await Display.start(displaySize);
    if (!display) return null;

    return new VirtualCapture({
      display,
      offset: options.offset,
      savePath: options.savePath,
      size: videoSize
    });
  }

  static isEnabled(): boolean {
    return isCI && platform() === "linux";
  }

  public get display() {
    return this._options.display;
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

    await this._options.display.stop();
  }
}
