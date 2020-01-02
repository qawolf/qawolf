import { CONFIG } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists } from "fs-extra";
import { Capture } from "../src/Capture";
import { Display } from "../src/Display";

it("captures a video and gif", async () => {
  const size = { height: 1080, width: 1920 };
  const display = await Display.start(size);
  const capture = await Capture.start({
    display,
    savePath: `${CONFIG.videoPath}/Capture.test.ts`,
    size
  });
  await sleep(3000);
  await capture!.stop();
  await display.stop();
  expect(await pathExists(capture!._videoPath)).toBeTruthy();
  expect(await pathExists(capture!._gifPath)).toBeTruthy();
});
