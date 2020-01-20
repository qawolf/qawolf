import { CONFIG } from "@qawolf/config";
import { VirtualCapture } from "@qawolf/screen";
import { sleep } from "@qawolf/web";
import { pathExists } from "fs-extra";
import { platform } from "os";
import { launch } from "../../src/browser/launch";

describe("launch and VirtualCapture", () => {
  it("records a video on linux CI", async () => {
    const browser = await launch({ device: "iPhone 7", url: CONFIG.testUrl });

    const capture = browser.qawolf._capture;
    if (platform() !== "linux") {
      expect(capture).toEqual(null);
      expect(VirtualCapture.isEnabled()).toEqual(false);
      await browser.close();
      return;
    }

    expect(VirtualCapture.isEnabled()).toEqual(true);

    if (!capture) throw new Error("VirtualCapture should be created on linux");

    // ffmpeg requires even numbers, so expect the size to be rounded up
    expect(capture.size).toEqual({ height: 668, width: 376 });

    // creates a display
    expect(capture.xvfb).toBeTruthy();

    await sleep(500);
    await browser.close();

    expect(capture.stopped).toEqual(true);

    expect(await pathExists(capture.videoPath)).toBeTruthy();
    expect(await pathExists(capture.gifPath)).toBeTruthy();
  });
});
