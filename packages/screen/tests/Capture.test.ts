import { makeTempDir } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists, remove } from "fs-extra";
import { Capture } from "../src/Capture";

it("captures a video and gif", async () => {
  const tempDir = await makeTempDir();
  const capture = await Capture.start({
    savePath: tempDir,
    size: { height: 1080, width: 1920 }
  });
  await sleep(1000);
  await capture!.stop();
  expect(await pathExists(capture!.videoPath)).toBeTruthy();
  expect(await pathExists(capture!.gifPath)).toBeTruthy();
  await remove(tempDir);
});
