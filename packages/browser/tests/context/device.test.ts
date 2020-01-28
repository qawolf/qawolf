// https://github.com/microsoft/playwright/pull/692
import { DeviceDescriptors as devices } from "playwright-core/lib/deviceDescriptors";
import { getDevice } from "../../src/context/device";

describe("getDevice", () => {
  it('returns "desktop" size as default', () => {
    const device = getDevice();
    expect(device).toMatchObject(getDevice("desktop"));

    expect(device.viewport.width).toEqual(1366);
    expect(device.viewport.height).toEqual(768);
  });

  it("returns a playwright.Device by key", () => {
    expect(getDevice("iPhone 7")).toEqual(devices["iPhone 7"]);
  });

  it("throws an error for an invalid device key", () => {
    let message = false;
    try {
      getDevice("not a device");
    } catch (e) {
      message = e.message;
    }
    expect(message).toEqual(`playwright.devices["not a device"] was not found`);
  });

  it("returns a Device back if it is passed in", () => {
    const device = devices["iPhone 7"];
    const result = getDevice(devices["iPhone 7"]);
    expect(result).toEqual(device);
  });
});
