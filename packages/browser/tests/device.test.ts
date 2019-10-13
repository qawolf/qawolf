import { devices } from "puppeteer";
import { getDevice } from "../src/device";

test('getDevice "desktop" size is correct', () => {
  const device = getDevice("desktop");
  expect(device.viewport.width).toEqual(1366);
  expect(device.viewport.height).toEqual(768);
});

test('getDevice "tablet" is an iPad', () => {
  const device = getDevice("tablet");
  expect(device).toEqual(devices["iPad"]);
});

test('getDevice "mobile" is an iPhone', () => {
  const device = getDevice("mobile");
  expect(device).toEqual(devices["iPhone 7"]);
});
