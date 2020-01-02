import { Display } from "./Display";
import { CaptureOffset, CaptureSize } from "./types";

export interface CaptureOptions {
  display: Display;
  offset?: CaptureOffset;
  savePath: string;
  size: CaptureSize;
}

export const buildCaptureArgs = (options: CaptureOptions) => {
  const offset = options.offset || { x: 0, y: 0 };

  // ffmpeg requires dimensions to be divisible by 2
  const height = makeEven(options.size.height);
  const width = makeEven(options.size.width);

  const args = [
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
    `${width}x${height}`,
    // input
    "-i",
    //:display+x,y offset
    `${options.display.screen}+${offset.x},${offset.y}`,
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

  return args;
};

export const getPath = (): string | null => {
  const isInstalled = require.resolve("ffmpeg-static");
  if (!isInstalled) return null;

  const ffmpegPath = require("ffmpeg-static");
  return ffmpegPath;
};

const makeEven = (x: number) => {
  return Math.ceil(x / 2) * 2;
};
