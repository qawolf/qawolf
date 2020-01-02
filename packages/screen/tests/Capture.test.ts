import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { spawn } from "child_process";
import { pathExists } from "fs-extra";
import path from "path";
import { Capture } from "../src/Capture";
import { Display } from "../src/Display";

it("captures a video and gif", async () => {
  const size = { height: 1080, width: 1920 };
  const display = await Display.start(size);

  const capture = await Capture.start({
    display,
    // drawMouse: true,
    savePath: `${CONFIG.videoPath}/Capture.test.ts`,
    size
  });

  const imagePath = path.resolve(__dirname, "../fixtures/logo_small.png");
  const feh = spawn("feh", [imagePath], { env: { DISPLAY: display.value } });
  logger.debug(`spawn feh ${imagePath} ${display.value}`);

  await sleep(1000);

  await capture!.stop();
  await display.stop();

  feh.kill();
});
