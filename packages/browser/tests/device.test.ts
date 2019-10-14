import { devices } from "puppeteer";
import { getDevice } from "../src/device";

describe("getDevice", () => {
  it('returns correct "desktop" size', () => {
    const device = getDevice("desktop");
    expect(device.viewport.width).toEqual(1366);
    expect(device.viewport.height).toEqual(768);
  });

  it('returns an iPad for "tablet"', () => {
    const device = getDevice("tablet");
    expect(device).toEqual(devices["iPad"]);
  });

  it('returns an iPhone for "mobile"', () => {
    const device = getDevice("mobile");
    expect(device).toEqual(devices["iPhone 7"]);
  });
});
