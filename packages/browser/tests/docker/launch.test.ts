import { CONFIG, makeTempDir } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists, readdir, remove } from "fs-extra";
import { launch } from "../../src/browser/launch";

describe("launch", () => {
  it("records dom replayer and a video", async () => {
    CONFIG.domPath = await makeTempDir();
    CONFIG.videoPath = await makeTempDir();

    const browser = await launch({ device: "iPhone 7", url: CONFIG.testUrl });

    const screenCapture = browser.qawolf._screenCapture;
    expect(screenCapture).toBeTruthy();

    await sleep(500);
    await browser.close();

    expect(await pathExists(screenCapture!.videoPath)).toBeTruthy();
    expect(await pathExists(screenCapture!.gifPath)).toBeTruthy();
    await remove(CONFIG.videoPath);

    // 668 instead of 667 since it rounds up to even numbers
    expect(screenCapture!.size).toMatchObject({
      height: 668,
      width: 376
    });

    const domFiles = await readdir(browser.qawolf.domPath!);
    expect(domFiles.filter(f => f.includes(".html"))).toHaveLength(1);
  });
});
