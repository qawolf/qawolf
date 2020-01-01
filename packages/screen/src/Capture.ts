import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { ensureDir } from "fs-extra";
import { resolve } from "path";
import { createGif } from "./createGif";
import { Display } from "./Display";
import { buildCaptureArgs, getPath } from "./ffmpeg";
import { CaptureSize, CaptureOptions } from "./types";

interface ConstructorOptions extends CaptureOptions {
  display: Display;
  ffmpegPath: string;
}

export class Capture {
  /**
   * Catpure the x11 display with ffmpeg in a child process.
   */
  private _closed: boolean = false;
  private _ffmpeg: ChildProcessWithoutNullStreams;
  private _ffmpegPath: string;
  private _gifPath: string;
  private _videoPath: string;
  private _size: CaptureSize;

  protected constructor(options: ConstructorOptions) {
    const startedAt = Date.now();
    this._ffmpegPath = options.ffmpegPath;
    this._gifPath = `${options.savePath}/video_${startedAt}.gif`;
    this._videoPath = `${options.savePath}/video_${startedAt}.mp4`;

    this._size = options.size;

    this._ffmpeg = spawn(
      options.ffmpegPath,
      buildCaptureArgs({
        display: options.display.value,
        offset: options.offset,
        savePath: this._videoPath,
        size: options.size
      })
    );

    this._ffmpeg.stdout.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });

    this._ffmpeg.stderr.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });
  }

  public get gifPath() {
    return this._gifPath;
  }

  public get size() {
    return this._size;
  }

  public get videoPath() {
    return this._videoPath;
  }

  public static async start(options: CaptureOptions) {
    const ffmpegPath = getPath();
    if (!ffmpegPath) {
      logger.error("Capture: need ffmpeg installed to start");
      return null;
    }

    const display = await Display.start(options.size);
    if (!display) {
      logger.error("Capture: need xvfb installed to start");
      return null;
    }

    logger.verbose(`Capture: start ${JSON.stringify(options)}`);

    const path = resolve(options.savePath);
    await ensureDir(path);

    const capture = new Capture({
      ...options,
      display,
      ffmpegPath
    });
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
