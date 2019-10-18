import { makeTempDir } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists, remove } from "fs-extra";
import { Recorder } from "../src/Recorder";

it("records a video and gif", async () => {
  const tempDir = await makeTempDir();
  const recorder = await Recorder.start({
    savePath: tempDir,
    size: { height: 1080, width: 1920 }
  });
  await sleep(1000);
  await recorder!.stop();
  expect(await pathExists(`${tempDir}/video.mp4`)).toBeTruthy();
  expect(await pathExists(`${tempDir}/video.gif`)).toBeTruthy();
  await remove(tempDir);
});
