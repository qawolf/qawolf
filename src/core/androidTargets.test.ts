import { describe, expect, it } from "bun:test";
import {
  avdDeviceId,
  avdNameForTarget,
  buildSystemImage,
  makeAvdName,
} from "./androidTargets.js";

describe("avdDeviceId", () => {
  it("should keep a model that is an avdmanager device id", () => {
    expect(avdDeviceId("pixel_9")).toBe("pixel_9");
  });

  it("should map any_phone to pixel_9", () => {
    expect(avdDeviceId("any_phone")).toBe("pixel_9");
  });

  it("should map any_tablet to pixel_tablet", () => {
    expect(avdDeviceId("any_tablet")).toBe("pixel_tablet");
  });
});

describe("makeAvdName", () => {
  it("should produce qawolf-prefixed avd name with underscored model", () => {
    expect(makeAvdName("Pixel 9", "35")).toBe("qawolf_pixel_9_api35");
  });

  it("should replace spaces with underscores in multi-word model", () => {
    expect(makeAvdName("Pixel Tablet", "34")).toBe("qawolf_pixel_tablet_api34");
  });

  it("should name the any_phone AVD after the pixel_9 device", () => {
    expect(makeAvdName("any_phone", "37")).toBe("qawolf_pixel_9_api37");
  });

  it("should name the any_tablet AVD after the pixel_tablet device", () => {
    expect(makeAvdName("any_tablet", "37")).toBe("qawolf_pixel_tablet_api37");
  });
});

describe("buildSystemImage", () => {
  it("should build arm64-v8a image path for arm64 arch and API 34", () => {
    expect(buildSystemImage("34", "arm64")).toBe(
      "system-images;android-34;google_apis_playstore;arm64-v8a",
    );
  });

  it("should build x86_64 image path for x64 arch", () => {
    expect(buildSystemImage("35", "x64")).toBe(
      "system-images;android-35;google_apis_playstore;x86_64",
    );
  });

  it("should throw for unsupported architectures", () => {
    expect(() => buildSystemImage("35", "ia32" as NodeJS.Architecture)).toThrow(
      "Unsupported host architecture for Android AVD: ia32",
    );
  });

  it("should use google_apis (no playstore) for API 36 and above", () => {
    expect(buildSystemImage("36", "arm64")).toBe(
      "system-images;android-36;google_apis;arm64-v8a",
    );
  });

  it("should use the android-37.0 platform id for API 37", () => {
    expect(buildSystemImage("37", "arm64")).toBe(
      "system-images;android-37.0;google_apis;arm64-v8a",
    );
  });
});

describe("avdNameForTarget", () => {
  it("should return the AVD name for a fully-qualified Android target", () => {
    expect(avdNameForTarget("Android - Pixel 9 (Android 15)")).toBe(
      "qawolf_pixel_9_api35",
    );
  });

  it("should return the same AVD name for the renamed Pixel 9 target", () => {
    expect(
      avdNameForTarget("Android - Google Pixel 9 (Android 15 | Emulator)"),
    ).toBe("qawolf_pixel_9_api35");
  });

  it("should return the AVD name for the bare 'Android - Pixel' preset", () => {
    expect(avdNameForTarget("Android - Pixel")).toBe("qawolf_pixel_2_api34");
  });

  it.each([
    ["Android - Any Phone (Latest | Emulator)", "qawolf_pixel_9_api37"],
    ["Android - Any Phone (Android 16 | Emulator)", "qawolf_pixel_9_api36"],
    ["Latest Android (Phone)", "qawolf_pixel_9_api37"],
    ["Android 36 - Any Phone", "qawolf_pixel_9_api36"],
    ["Android - Any Tablet (Latest | Emulator)", "qawolf_pixel_tablet_api37"],
    ["Latest Android (Tablet)", "qawolf_pixel_tablet_api37"],
  ])("should map the 'Any' preset %p to the Pixel AVD %p", (target, avd) => {
    expect(avdNameForTarget(target)).toBe(avd);
  });

  it.each([
    "Android - Samsung Galaxy A17 (Android 16)",
    "Android - Samsung Galaxy A37 (Android 16)",
  ])("should return undefined for the physical-phone preset %p", (target) => {
    expect(avdNameForTarget(target)).toBeUndefined();
  });

  it("should return undefined for a non-Android target", () => {
    expect(avdNameForTarget("Web - Chrome")).toBeUndefined();
  });

  it("should return undefined for an unparseable string", () => {
    expect(avdNameForTarget("not-a-real-target")).toBeUndefined();
  });
});
