import { execFile as execFileWithCallback } from "child_process";
import util from "util";

import config from "../config";

const execFile = util.promisify(execFileWithCallback);

export type ProbeVideoFileOptions = {
  showChapters?: boolean;
  showFormat?: boolean;
};

export const probeVideoFile = async (
  videoPath: string,
  options: ProbeVideoFileOptions = {}
) => {
  const args = [];

  if (options.showChapters === true) {
    args.push("-show_chapters");
  }
  if (options.showFormat === true) {
    args.push("-show_format");
  }

  const { stdout } = await execFile(config.FFPROBE_PATH, [
    ...args,
    "-print_format",
    "json",
    videoPath,
  ]);

  return JSON.parse(stdout);
};
