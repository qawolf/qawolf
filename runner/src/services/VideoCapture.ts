import { spawn } from "child_process";
import Debug from "debug";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { sep } from "path";

import config from "../config";

const debug = Debug("qawolf:VideoCapture");

export class VideoCapture {
  readonly _framesPerSecond = 20;
  readonly _shrunkHeight = 640;

  _ffmpeg?: FfmpegCommand;
  _gifPath = "set_in_start_function.gif";
  _rejectStopped?: (reason: string) => void;
  _resolveStarted?: () => void;
  _resolveStopped?: () => void;
  _startedPromise: Promise<void>;
  _stopped = false;
  _stoppedPromise: Promise<void>;
  _videoPath = "set_in_start_function.mp4";

  constructor() {
    this._startedPromise = new Promise((resolve) => {
      this._resolveStarted = resolve;
    });

    this._stoppedPromise = new Promise((resolve, reject) => {
      this._resolveStopped = resolve;
      this._rejectStopped = reject;
    });
  }

  async createGif(): Promise<void> {
    if (!this._stopped) {
      throw new Error("Cannot create gif before video is stopped");
    }

    debug("create gif %s", this._gifPath);

    return new Promise((resolve, reject) => {
      console.log("try to spawn", config.FFMPEG_PATH);

      const ffmpeg = spawn("sh", [
        "-c",
        // https://askubuntu.com/a/837574/856776
        // skip 1 second (launch is black screen)
        // speed up by 2x
        // limit gif to 30 seconds (1 minute of test time)
        `${config.FFMPEG_PATH} -i ${this._videoPath} -ss 1 -vf "fps=10,scale=${this._shrunkHeight}:-1:flags=lanczos,setpts=0.5*PTS" -t 30 ${this._gifPath}`,
      ]);

      let stderr = "";

      ffmpeg.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          debug("created gif %s", this._gifPath);
          resolve();
        } else {
          debug("could not create gif %s", stderr);
          reject();
        }
      });
    });
  }

  get gifPath(): string {
    return this._gifPath;
  }

  async start(display = ":0.0"): Promise<void> {
    const path = await fs.mkdtemp(`${tmpdir()}${sep}`);
    this._gifPath = `${path}${sep}video.gif`;
    this._videoPath = `${path}${sep}video.mp4`;
    debug("start video capture to %s", this._videoPath);

    let stderr = "";

    this._ffmpeg = ffmpeg()
      .addInput(display)
      .inputFPS(this._framesPerSecond)
      .addInputOptions([
        "-draw_mouse 0",
        "-y",
        "-f",
        "x11grab",
        `-video_size ${config.DISPLAY_WIDTH}x${config.DISPLAY_HEIGHT}`,
      ])
      .outputOptions(["-preset ultrafast", "-pix_fmt yuv420p"])
      .on("start", () => {
        debug("started");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._resolveStarted!();
      })
      .on("stderr", (data) => {
        stderr += data.toString();
      })
      .on("error", (err) => {
        debug("errored %s %s", err.message, stderr);
        this._stopped = true;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._rejectStopped!(err.message);
      })
      .on("end", () => {
        debug("ended");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._resolveStopped!();
      })
      .save(this._videoPath);

    await this._startedPromise;
  }

  async stop(): Promise<void> {
    if (!this._ffmpeg) {
      debug("video capture never started");
      return;
    }

    if (this._stopped) {
      debug("video capture already stopped");
      await this._stoppedPromise;
    }

    debug("stop video capture");

    this._stopped = true;

    // make sure the last frames capture
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/662#issuecomment-278375650
    // eslint-disable-next-line
    const proc = (this._ffmpeg! as any).ffmpegProc;
    if (proc) proc.stdin.write("q");

    await this._stoppedPromise;
  }

  get videoPath(): string {
    return this._videoPath;
  }
}
