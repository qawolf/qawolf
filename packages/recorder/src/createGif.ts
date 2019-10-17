import { logger } from "@qawolf/logger";
import { spawn } from "child_process";

export const createGif = (videoPath: string, gifPath: string) => {
  logger.debug(`createGif: creating for ${videoPath} -> ${gifPath}`);

  return new Promise(resolve => {
    const ffmpeg = spawn("sh", [
      "-c",
      // https://superuser.com/a/556031/856890
      `ffmpeg -i ${videoPath} -vf "fps=10,scale=640:-1:flags=lanczos,setpts=0.25*PTS" -c:v pam -f image2pipe - | convert -delay 10 - -loop 0 -layers optimize ${gifPath}`
    ]);

    ffmpeg.on("close", () => {
      logger.debug("createGif: done");
      resolve();
    });

    ffmpeg.stdout.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });

    ffmpeg.stderr.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });
  });
};
