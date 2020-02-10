import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { ensureDir } from "fs-extra";
import { pick } from "lodash";
import { dirname } from "path";
import { getPath } from "./ffmpeg";
import { Offset, Size } from "./types";
import { Xvfb } from "./Xvfb";

export interface VideoCaptureOptions {
  offset: Offset;
  savePath: string;
  size: Size;
  xvfb: Xvfb;
}

const buildArgs = (options: VideoCaptureOptions) => [
  // grab the X11 display
  "-f",
  "x11grab",
  // do not draw the mouse
  "-draw_mouse",
  "0",
  // 20 fps
  "-framerate",
  "20",
  // record display size
  "-video_size",
  `${options.size.width}x${options.size.height}`,
  // input
  "-i",
  //:display+x,y offset
  `${options.xvfb.screen()}+${options.offset.x},${options.offset.y}`,
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
  options.savePath
];

export class VideoCapture {
  /**
   * Capture the x11 display with ffmpeg in a child process.
   */
  private _ffmpeg: ChildProcessWithoutNullStreams;

  // public for tests
  public _size: Size;

  private _stopped: boolean = false;

  protected constructor(options: VideoCaptureOptions, ffmpegPath: string) {
    this._size = options.size;

    const args = buildArgs(options);
    logger.debug(`VideoCapture: spawn ${ffmpegPath} ${JSON.stringify(args)}`);
    this._ffmpeg = spawn(ffmpegPath, args);

    this._ffmpeg.stdout.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });

    this._ffmpeg.stderr.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });
  }

  public static async start(options: VideoCaptureOptions) {
    const ffmpegPath = getPath();
    if (!ffmpegPath) {
      logger.error("VideoCapture: need ffmpeg installed to start");
      return null;
    }

    logger.verbose(
      `VideoCapture: start ${JSON.stringify(
        pick(options, "offset", "savePath", "size")
      )}`
    );

    await ensureDir(dirname(options.savePath));

    const capture = new VideoCapture(options, ffmpegPath);
    return capture;
  }

  public stopped() {
    return this._stopped;
  }

  public async stop(): Promise<void> {
    if (this._stopped) {
      logger.error("VideoCapture: already stopped");
      return;
    }

    this._stopped = true;
    logger.verbose("VideoCapture: stopping");

    return new Promise(async resolve => {
      this._ffmpeg.on("close", async () => {
        logger.verbose("VideoCapture: stopped");
        resolve();
      });

      // give ffmpeg time to process last frames
      await sleep(500);

      try {
        // stop and finish Capture
        // from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/662#issuecomment-278375650
        this._ffmpeg.stdin.write("q");
      } catch (e) {}
    });
  }
}
