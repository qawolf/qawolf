import { sleep } from "@qawolf/web";
import { mkdtemp, pathExists, remove } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";
import { Recorder } from "../src/Recorder";

const makeTempDir = () => {
  return mkdtemp(join(tmpdir(), "recorder-"));
};

it("records a video and gif", async () => {
  const tempDir = await makeTempDir();
  const recorder = await Recorder.start(tempDir);
  await sleep(1000);
  await recorder!.stop();
  expect(await pathExists(`${tempDir}/video.mp4`)).toBeTruthy();
  expect(await pathExists(`${tempDir}/video.gif`)).toBeTruthy();
  await remove(tempDir);
});
