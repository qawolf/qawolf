import { spawn } from "child_process";
import Debug from "debug";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { sep } from "path";

import config from "../config";
import { probeVideoFile } from "../services/ffprobe";
import { VideoChapter } from "../types";

const debug = Debug("qawolf:VideoCapture");

export class VideoCapture {
  readonly _framesPerSecond = 20;
  readonly _shrunkHeight = 640;

  _chapters: VideoChapter[] = [];
  _ffmpeg?: FfmpegCommand;
  _gifPath = "set_in_start_function.gif";
  _jsonPath = "set_in_start_function.json";
  _rejectStopped?: (reason: string) => void;
  _resolveStarted?: () => void;
  _resolveStopped?: () => void;
  _startedPromise: Promise<void>;
  _stopped = false;
  _stoppedPromise: Promise<void>;
  _timingsPath = "set_in_start_function.txt";
  _videoMetadataPath = "set_in_start_function.txt";
  _videoPath = "set_in_start_function.mp4";
  _videoWithMetadataPath = "set_in_start_function.mp4";

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
      debug("try to spawn %s", config.FFMPEG_PATH);

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

  markChapter(lineNum: number, lineCode: string): void {
    // Setting by index rather than .push in case this is called
    // multiple times for the same line number, which it seems to be.
    this._chapters[lineNum] = {
      lineCode,
      lineNum,
      start: Date.now(),
    };
  }

  async _setChapterMetadata(): Promise<void> {
    if (!this._stopped) {
      throw new Error("Cannot set chapter metadata before video is stopped");
    }

    debug("set chapters in %s", this._videoPath);

    const timings = (await fs.readFile(this._timingsPath))
      .toString()
      .split("\n");

    const firstFrame = Number(timings[1]);

    await fs.writeFile(
      this._jsonPath,
      JSON.stringify({ chapters: this._chapters, timings })
    );

    this._chapters.forEach((c) => (c.start = c.start - firstFrame));

    const videoMetadata = await probeVideoFile(this._videoPath, {
      showFormat: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const videoLengthMS = videoMetadata.format!.duration * 1000;

    const metadata = `;FFMETADATA1
title=Test Run
artist=QA Wolf, Inc.
${this._chapters.reduce(
  (acc: string, chapter: VideoChapter, currentIndex) => `${acc}

[CHAPTER]
TIMEBASE=1/1000
START=${chapter.start}
END=${this._chapters[currentIndex + 1]?.start || videoLengthMS}
line=${chapter.lineNum}
title=${chapter.lineCode}
`,
  ""
)}
`;

    await fs.writeFile(this._videoMetadataPath, metadata);

    return new Promise((resolve, reject) => {
      debug("try to spawn %s", config.FFMPEG_PATH);

      const ffmpeg = spawn("sh", [
        "-c",
        `${config.FFMPEG_PATH} -i ${this._videoPath} -i ${this._videoMetadataPath} -map_metadata 1 -codec copy ${this._videoWithMetadataPath}`,
      ]);

      let stderr = "";

      ffmpeg.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          debug(
            "created video copy with metadata %s",
            this._videoWithMetadataPath
          );
          resolve();
        } else {
          debug("could not add video metadata %s", stderr);
          reject();
        }
      });
    });
  }

  async start(display = ":0.0"): Promise<void> {
    const path = await fs.mkdtemp(`${tmpdir()}${sep}`);
    this._jsonPath = `${path}${sep}metadata.json`;
    this._gifPath = `${path}${sep}video.gif`;
    this._timingsPath = `${path}${sep}timings.txt`;
    this._videoMetadataPath = `${path}${sep}video-metadata.txt`;
    this._videoPath = `${path}${sep}video.mp4`;
    this._videoWithMetadataPath = `${path}${sep}video-with-metadata.mp4`;
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

    await this._setChapterMetadata();
  }

  get videoPath(): string {
    return this._videoPath;
  }

  get videoWithMetadataPath(): string {
    return this._videoWithMetadataPath;
  }
}
