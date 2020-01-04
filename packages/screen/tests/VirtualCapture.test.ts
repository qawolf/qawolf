import { CONFIG } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists } from "fs-extra";
import { platform } from "os";
import { VirtualCapture } from "../src/VirtualCapture";

it("captures a video and gif on linux CI", async () => {
  const capture = await VirtualCapture.create({
    offset: { x: 0, y: 0 },
    savePath: CONFIG.artifactPath!,
    size: { height: 249, width: 249 }
  });

  if (platform() !== "linux") {
    expect(capture).toBeNull();
    expect(VirtualCapture.isEnabled()).toEqual(false);
    return;
  }

  expect(VirtualCapture.isEnabled()).toEqual(true);

  if (!capture) throw new Error("VirtualCapture should be created on linux");

  // ffmpeg requires even numbers, so expect the size to be rounded up
  expect(capture.size).toEqual({ height: 250, width: 250 });

  // creates a display
  expect(capture.display).toBeTruthy();

  await capture.start();
  // wait long enough to capture some frames
  await sleep(10000);
  await capture.stop();

  expect(await pathExists(capture.videoPath)).toBeTruthy();
  expect(await pathExists(capture.gifPath)).toBeTruthy();
});
