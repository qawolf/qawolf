import { CONFIG } from "@qawolf/config";
import { QAWolfWeb, sleep } from "@qawolf/web";
import { pathExists, readdir } from "fs-extra";
import { platform } from "os";
import { getDevice } from "../../src/browser/device";
import { launch } from "../../src/browser/launch";

describe("launch", () => {
  it("injects qawolf", async () => {
    const browser = await launch({ url: CONFIG.testUrl });

    const isLoaded = () => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return !!qawolf;
    };

    const pageZero = await browser.page({ page: 0 });
    const zeroIsLoaded = await pageZero.evaluate(isLoaded);
    expect(zeroIsLoaded).toBeTruthy();

    // check it loads on a new page
    await browser.newPage();
    const pageOne = await browser.page({ page: 1 });
    const oneIsLoaded = await pageOne.evaluate(isLoaded);
    expect(oneIsLoaded).toBeTruthy();

    await browser.close();
  });

  it("emulates device", async () => {
    const browser = await launch({
      device: "iPhone 7",
      url: CONFIG.testUrl
    });

    const expectedViewport = getDevice("iPhone 7").viewport;
    expect((await browser.page({ page: 0 })).viewport()).toEqual(
      expectedViewport
    );

    // check it emulates on a new page
    await browser.newPage();
    expect((await browser.page({ page: 1 })).viewport()).toEqual(
      expectedViewport
    );

    await browser.close();
  });

  it("records dom replay", async () => {
    const domFiles = await readdir(CONFIG.artifactPath!);
    expect(
      domFiles.filter((f: string) => f.includes(".html")).length
    ).toBeGreaterThan(0);
  });

  it("records a video on linux CI", async () => {
    const browser = await launch({ device: "iPhone 7", url: CONFIG.testUrl });

    const capture = browser.qawolf._capture;
    if (platform() !== "linux") {
      expect(capture).toEqual(null);
      await browser.close();
      return;
    }

    if (!capture) throw new Error("VirtualCapture should be created on linux");
    await sleep(500);
    await browser.close();

    expect(await pathExists(capture.videoPath)).toBeTruthy();
    expect(await pathExists(capture.gifPath)).toBeTruthy();
  });
});
