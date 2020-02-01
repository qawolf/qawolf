import { CONFIG } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists } from "fs-extra";
import { platform } from "os";
import { launch } from "../../src/context/launch";

describe("launch and VirtualCapture", () => {
  it("records a video on linux CI", async () => {
    const context = await launch({ device: "iPhone 7", url: CONFIG.testUrl });

    const capture = context.qawolf._capture;
    if (platform() !== "linux") {
      expect(capture).toEqual(null);
      await context.close();
      return;
    }

    if (!capture) throw new Error("VirtualCapture should be created on linux");

    // creates a display
    expect(capture.xvfb).toBeTruthy();

    await sleep(500);
    await context.close();

    expect(capture.stopped).toEqual(true);

    expect(await pathExists(capture.videoPath)).toBeTruthy();
    expect(await pathExists(capture.gifPath)).toBeTruthy();
  });
});
