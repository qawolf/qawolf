import { CONFIG } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists, readdir } from "fs-extra";
import { launch } from "../../src/browser/launch";

describe("launch", () => {
  it("records dom replayer and a video", async () => {
    const browser = await launch({ device: "iPhone 7", url: CONFIG.testUrl });

    const capture = browser.qawolf._capture;
    expect(capture).toBeTruthy();

    await sleep(500);
    await browser.close();

    expect(await pathExists(capture!._videoPath)).toBeTruthy();
    expect(await pathExists(capture!._gifPath)).toBeTruthy();

    // 668 instead of 667 since it rounds up to even numbers
    expect(capture!._size).toMatchObject({
      height: 668,
      width: 376
    });

    const domFiles = await readdir(browser.qawolf.domPath!);
    expect(domFiles.filter(f => f.includes(".html"))).toHaveLength(1);
  });
});
