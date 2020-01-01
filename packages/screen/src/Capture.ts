import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { ensureDir } from "fs-extra";
import { omit } from "lodash";
import { resolve } from "path";
import { createGif } from "./createGif";
import { buildCaptureArgs, CaptureOptions, getPath } from "./ffmpeg";
import { CaptureSize } from "./types";

export class Capture {
  /**
   * Catpure the x11 display with ffmpeg in a child process.
   */
  private _closed: boolean = false;

  private _ffmpeg: ChildProcessWithoutNullStreams;
  private _ffmpegPath: string;

  // public for tests
  public _gifPath: string;
  public _videoPath: string;
  public _size: CaptureSize;

  protected constructor(options: CaptureOptions, ffmpegPath: string) {
    this._ffmpegPath = ffmpegPath;
    this._size = options.size;

    const startedAt = Date.now();
    this._gifPath = `${options.savePath}/video_${startedAt}.gif`;
    this._videoPath = `${options.savePath}/video_${startedAt}.mp4`;

    const args = buildCaptureArgs(options);
    logger.debug(`Capture: spawn ${this._ffmpegPath} ${JSON.stringify(args)}`);
    this._ffmpeg = spawn(this._ffmpegPath, args);

    this._ffmpeg.stdout.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });

    this._ffmpeg.stderr.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });
  }

  public static async start(options: CaptureOptions) {
    const ffmpegPath = getPath();
    if (!ffmpegPath) {
      logger.error("Capture: need ffmpeg installed to start");
      return null;
    }

    logger.verbose(
      `Capture: start ${JSON.stringify(omit(options, "display"))}`
    );

    const path = resolve(options.savePath);
    await ensureDir(path);

    const capture = new Capture(options, ffmpegPath);
    return capture;
  }

  public async stop() {
    if (this._closed) {
      logger.error("Capture: already stopped");
      return;
    }

    this._closed = true;
    logger.verbose("Capture: stopping");

    return new Promise(async resolve => {
      this._ffmpeg.on("close", async () => {
        logger.verbose("Capture: stopped");
        await createGif({
          ffmpegPath: this._ffmpegPath,
          gifPath: this._gifPath,
          size: this._size,
          videoPath: this._videoPath
        });

        resolve();
      });

      // give ffmpeg time to process last frames
      await sleep(500);

      // stop and finish Capture
      // from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/662#issuecomment-278375650
      this._ffmpeg.stdin.write("q");
    });
  }
}
