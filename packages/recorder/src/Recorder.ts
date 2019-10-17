import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { ensureDir } from "fs-extra";
import { resolve } from "path";
import { createGif } from "./createGif";

export class Recorder {
  /**
   * Records the x11 display with ffmpeg in a child process.
   */
  private _closed: boolean = false;
  private _ffmpeg: ChildProcessWithoutNullStreams;
  private _gifPath: string;
  private _videoPath: string;

  protected constructor(savePath: string) {
    logger.verbose(`Recorder: recording to ${savePath}`);
    this._gifPath = `${savePath}/video.gif`;
    this._videoPath = `${savePath}/video.mp4`;

    this._ffmpeg = spawn("ffmpeg", this.buildArgs());

    this._ffmpeg.stdout.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });

    this._ffmpeg.stderr.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });
  }

  public get videoPath() {
    return this._videoPath;
  }

  public static async start(savePath: string) {
    if (!CONFIG.docker) {
      logger.error(`Recorder: disabled outside of qawolf docker`);
      return null;
    }

    const path = resolve(savePath);
    await ensureDir(path);

    const recorder = new Recorder(path);
    return recorder;
  }

  private buildArgs() {
    return [
      // grab the X11 display
      "-f",
      "x11grab",
      // don't draw the mouse
      // "-drawmouse",
      // "0",
      // 20 fps
      "-framerate",
      "20",
      // record display size
      "-video_size",
      `1920x1080`,
      // input
      "-i",
      //:display+x,y offset
      `${CONFIG.display}+0,0`,
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
      logger.error("Recorder already stopped");
      return;
    }

    this._closed = true;
    logger.verbose("Recorder: stopping");

    return new Promise(resolve => {
      this._ffmpeg.on("close", async () => {
        logger.verbose("Recorder: stopped");
        await createGif(this._videoPath, this._gifPath);
        resolve();
      });

      // stop and finish recorder
      // from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/662#issuecomment-278375650
      this._ffmpeg.stdin.write("q");
    });
  }
}
