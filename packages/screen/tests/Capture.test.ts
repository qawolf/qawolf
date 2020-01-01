import { CONFIG } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists } from "fs-extra";
import { Capture } from "../src/Capture";

it("captures a video and gif", async () => {
  const capture = await Capture.start({
    savePath: `${CONFIG.videoPath}/Capture.test.ts`,
    size: { height: 1080, width: 1920 }
  });
  await sleep(3000);
  await capture!.stop();
  expect(await pathExists(capture!.videoPath)).toBeTruthy();
  expect(await pathExists(capture!.gifPath)).toBeTruthy();
});
