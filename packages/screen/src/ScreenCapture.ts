import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { ensureDir } from "fs-extra";
import { resolve } from "path";
import { createGif } from "./createGif";
import { CaptureOffset, CaptureSize } from "./types";

type ScreenCaptureStartOptions = {
  offset?: CaptureOffset;
  savePath: string;
  size: CaptureSize;
};

export class ScreenCapture {
  /**
   * Captures the x11 display with ffmpeg in a child process.
   */
  private _closed: boolean = false;
  private _ffmpeg: ChildProcessWithoutNullStreams;
  private _gifPath: string;
  private _offset: CaptureOffset;
  private _videoPath: string;
  private _size: CaptureSize;

  protected constructor(options: ScreenCaptureStartOptions) {
    this._gifPath = `${options.savePath}/video.gif`;
    this._videoPath = `${options.savePath}/video.mp4`;

    this._offset = options.offset || { x: 0, y: 0 };
    this._size = options.size;

    this._ffmpeg = spawn("ffmpeg", this.buildArgs());

    this._ffmpeg.stdout.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });

    this._ffmpeg.stderr.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });
  }

  public get size() {
    return this._size;
  }

  public get videoPath() {
    return this._videoPath;
  }

  public static async start(options: ScreenCaptureStartOptions) {
    if (!CONFIG.docker) {
      logger.error(`ScreenCapture: disabled outside of qawolf docker`);
      return null;
    }

    // ffmpeg requires dimensions to be divisible by 2
    options.size.height = makeEven(options.size.height);
    options.size.width = makeEven(options.size.width);

    logger.verbose(`ScreenCapture: start ${JSON.stringify(options)}`);

    const path = resolve(options.savePath);
    await ensureDir(path);

    const screenCapture = new ScreenCapture(options);
    return screenCapture;
  }

  private buildArgs() {
    return [
      // grab the X11 display
      "-f",
      "x11grab",
      // hide mouse
      "-draw_mouse",
      "0",
      // 20 fps
      "-framerate",
      "20",
      // record display size
      "-video_size",
      `${this._size.width}x${this._size.height}`,
      // input
      "-i",
      //:display+x,y offset
      `${CONFIG.display}+${this._offset.x},${this._offset.y}`,
      // overwrite output
      "-y",
      // balance high quality and good compression https://superuser.com/a/582327/856890
      "-vcodec",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "19",
      "-preset",
      "slow",
      // mp4 plays well in browsers
      "-f",
      "mp4",
      this._videoPath
    ];
  }

  public async stop() {
    if (this._closed) {
      logger.error("ScreenCapture: already stopped");
      return;
    }

    this._closed = true;
    logger.verbose("ScreenCapture: stopping");

    return new Promise(async resolve => {
      this._ffmpeg.on("close", async () => {
        logger.verbose("ScreenCapture: stopped");
        await createGif({
          gifPath: this._gifPath,
          size: this._size,
          videoPath: this._videoPath
        });
        resolve();
      });

      // give ffmpeg time to process last frames
      await sleep(500);

      // stop and finish ScreenCapture
      // from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/662#issuecomment-278375650
      this._ffmpeg.stdin.write("q");
    });
  }
}

const makeEven = (x: number) => {
  return Math.ceil(x / 2) * 2;
};
