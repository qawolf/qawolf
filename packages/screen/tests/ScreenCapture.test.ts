import { makeTempDir } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists, remove } from "fs-extra";
import { ScreenCapture } from "../src/ScreenCapture";

it("captures a video and gif", async () => {
  const tempDir = await makeTempDir();
  const screenCapture = await ScreenCapture.start({
    savePath: tempDir,
    size: { height: 1080, width: 1920 }
  });
  await sleep(1000);
  await screenCapture!.stop();
  expect(await pathExists(`${tempDir}/video.mp4`)).toBeTruthy();
  expect(await pathExists(`${tempDir}/video.gif`)).toBeTruthy();
  await remove(tempDir);
});
