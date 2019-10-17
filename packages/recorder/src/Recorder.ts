import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { ensureDir } from "fs-extra";
import { resolve } from "path";

export class Recorder {
  /**
   * Records the x11 display with ffmpeg in a child process.
   */
  private _ffmpeg: ChildProcessWithoutNullStreams;
  private _stopped: boolean = false;
  private _videoPath: string;

  protected constructor(savePath: string) {
    this._videoPath = `${savePath}/video.mp4`;

    this._ffmpeg = spawn("ffmpeg", this.buildArgs());

    this._ffmpeg.stdout.on("data", function(data) {
      console.log("data", data.toString());
    });
    this._ffmpeg.stderr.on("data", function(data) {
      console.log("error", data.toString());
    });
    this._ffmpeg.on("close", function() {
      console.log("finished");
    });
  }

  public get videoPath() {
    return this._videoPath;
  }

  public static async start(savePath: string) {
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
      ":1.0+0,0",
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
    if (this._stopped) throw new Error("Recorder already stopped.");
    this._stopped = true;

    logger.debug(`Recorder: stopping`);

    // stop and finish recorder
    // from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/662#issuecomment-278375650
    this._ffmpeg.stdin.write("q");

    // give ffmpeg time to finalize
    await sleep(100);
    this._ffmpeg.kill("SIGTERM");

    // ensure ffmpeg is killed
    await sleep(2000);
    logger.debug(`Recorder: stopped`);
  }
}
