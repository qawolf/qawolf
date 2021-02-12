import Debug from "debug";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { sep } from "path";

import config from "../config";
import { CustomVideoMetadata } from "../types";
import { runCommand } from "../util";

const debug = Debug("qawolf:VideoCapture");

export class VideoCapture {
  readonly _framesPerSecond = 20;
  readonly _shrunkHeight = 640;

  _ffmpeg?: FfmpegCommand;
  _gifPath = "set_in_start_function.gif";
  _jsonPath = "set_in_start_function.json";
  _metadata: CustomVideoMetadata = {
    markers: [],
  };
  _rejectStopped?: (reason: string) => void;
  _resolveStarted?: () => void;
  _resolveStopped?: () => void;
  _startedPromise: Promise<void>;
  _stopped = false;
  _stoppedPromise: Promise<void>;
  _timingsPath = "set_in_start_function.txt";
  _videoMetadataPath = "set_in_start_function.txt";
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

    try {
      // https://askubuntu.com/a/837574/856776
      // skip 1 second (launch is black screen)
      // speed up by 2x
      // limit gif to 30 seconds (1 minute of test time)
      await runCommand(
        `${config.FFMPEG_PATH} -i ${this._videoPath} -ss 1 -vf "fps=10,scale=${this._shrunkHeight}:-1:flags=lanczos,setpts=0.5*PTS" -t 30 ${this._gifPath}`
      );
    } catch (error) {
      debug("could not create gif %s", error);
    }

    debug("created gif %s", this._gifPath);
  }

  async createMetadataJson(): Promise<void> {
    await this._buildMarkerMetadata();

    await fs.writeFile(this._jsonPath, JSON.stringify(this._metadata));
  }

  get gifPath(): string {
    return this._gifPath;
  }

  get jsonPath(): string {
    return this._jsonPath;
  }

  markLine(lineNum: number, lineCode: string): void {
    if (lineNum < 1) throw new Error("markLine: lineNum must be 1 or greater");

    debug("mark line %d: %s", lineNum, lineCode);

    if (!Array.isArray(this._metadata.markers)) this._metadata.markers = [];

    // Setting by index rather than .push in case this is called
    // multiple times for the same line number, which it seems to be.
    this._metadata.markers[lineNum - 1] = {
      lineCode,
      lineNum,
      startFrame: 1, // set in _buildMarkerMetadata
      startTimeAbsolute: Date.now(), // here this is approximate; in _buildMarkerMetadata we use final timing data to get more exact
      startTimeRelative: 0, // set in _buildMarkerMetadata
    };
  }

  async _buildMarkerMetadata(): Promise<void> {
    if (!this._stopped) {
      throw new Error("Cannot build marker metadata before video is stopped");
    }

    debug("build markers for %s", this._videoPath);

    const timings = (await fs.readFile(this._timingsPath))
      .toString()
      .split("\n")
      // Remove blank lines
      .filter((timestamp) => timestamp.trim().length > 0)
      // All remaining lines should be numbers, except first line, which we'll remove next
      .map((timestamp) => Number(timestamp));

    // The first line is a header so remove it
    timings.shift();

    // As a caution, if there is no timing information, log and skip the rest
    if (timings.length === 0) {
      debug("timings is empty");
      // Continue so at least we can save something to look at for debugging
    } else {
      const firstFrameTime = timings[0];
      for (const marker of this._metadata.markers || []) {
        const exactStartTimeAbsolute =
          timings.find((frameTime) => frameTime >= marker.startTimeAbsolute) ||
          timings[timings.length - 1];
        marker.startTimeAbsolute = exactStartTimeAbsolute;
        marker.startTimeRelative = exactStartTimeAbsolute - firstFrameTime;
        marker.startFrame = timings.indexOf(exactStartTimeAbsolute) + 1;
        if (marker.startFrame === 0) marker.startFrame = 1; // shouldn't happen but just in case
      }
    }

    this._metadata.timings = timings;
  }

  async start(display = ":0.0"): Promise<void> {
    const path = await fs.mkdtemp(`${tmpdir()}${sep}`);
    this._jsonPath = `${path}${sep}metadata.json`;
    this._gifPath = `${path}${sep}video.gif`;
    this._timingsPath = `${path}${sep}timings.txt`;
    this._videoMetadataPath = `${path}${sep}video-metadata.txt`;
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
        "-use_wallclock_as_timestamps 1",
        "-copyts",
      ])
      .outputOptions(["-preset ultrafast", "-pix_fmt yuv420p", "-vsync 0"])
      .output(this._videoPath)
      // balance high quality and good compression https://superuser.com/a/582327/856890
      .videoCodec("libx264")
      // save timings to correlate frames with time https://stackoverflow.com/a/49313678/230462
      .output(this._timingsPath)
      .outputOptions(["-c copy", "-vsync 0", "-flush_packets 1"])
      .format("mkvtimestamp_v2")
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
      });

    this._ffmpeg.run();

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
