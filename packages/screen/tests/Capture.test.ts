import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { exec } from "child_process";
import { pathExists } from "fs-extra";
import path from "path";
import { Capture } from "../src/Capture";
import { Display } from "../src/Display";

it("captures a video and gif", async () => {
  const size = { height: 1080, width: 1920 };
  const display = await Display.start(size);

  const capture = await Capture.start({
    display,
    drawMouse: true,
    savePath: `${CONFIG.videoPath}/Capture.test.ts`,
    size
  });

  // change the background color to capture something
  // const changeBackground = `xsetroot -display ${display.value} -solid "#43DFE1"`;
  // logger.debug(`cmd ${changeBackground}`);
  // exec(changeBackground, (err, stdout, stderr) => {
  //   if (err) {
  //     logger.debug(`couldn't execute the command: ${err.message}`);
  //     return;
  //   }

  //   // the *entire* stdout and stderr (buffered)
  //   logger.debug(`xsetroot stdout: ${stdout}`);
  //   logger.debug(`xsetroot stderr: ${stderr}`);
  // });

  await sleep(1000);

  await capture!.stop();
  await display.stop();
  // expect(await pathExists(capture!._videoPath)).toBeTruthy();
  // expect(await pathExists(capture!._gifPath)).toBeTruthy();
});
