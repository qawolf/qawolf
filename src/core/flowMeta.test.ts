import { describe, expect, it } from "bun:test";
import { classifyTarget, isAndroidTarget } from "./flowMeta.js";

describe("classifyTarget", () => {
  it("should return { kind: 'web', browser } for a web preset target", () => {
    expect(classifyTarget("Web - Chrome")).toEqual({
      kind: "web",
      browser: "chromium",
    });
  });

  it("should return { kind: 'android' } for an Android preset target", () => {
    expect(classifyTarget("Android - Pixel")).toEqual({ kind: "android" });
  });

  it.each([
    "Android - Pixel 9 (Android 15)",
    "Android - Google Pixel 9 (Android 16 | Emulator)",
    "Android - Google Pixel Tablet (Android 14 | Emulator)",
    "Android - Any Phone (Latest | Emulator)",
    "Android - Any Tablet (Latest | Emulator)",
    "Latest Android (Phone)",
    "Android 36 - Any Phone",
  ])(
    "should return { kind: 'android' } for the emulator preset %p",
    (target) => {
      expect(classifyTarget(target)).toEqual({ kind: "android" });
    },
  );

  it.each([
    "Android - Samsung Galaxy A17 (Android 16)",
    "Android - Samsung Galaxy A37 (Android 16)",
  ])(
    "should return { kind: 'unsupported' } for the physical-phone preset %p",
    (target) => {
      expect(classifyTarget(target)).toEqual({ kind: "unsupported" });
    },
  );

  it("should return { kind: 'ios' } for an iOS preset target", () => {
    expect(classifyTarget("iOS - iPad")).toEqual({ kind: "ios" });
  });

  it.each([
    "iOS - iPhone 15 (iOS 26)",
    "iOS - iPhone 15 (iOS 26 | Apple ID)",
    "iOS - Any iPhone (Latest)",
    "Latest iOS (iPhone)",
    "iOS 27 - Any iPhone",
  ])("should return { kind: 'ios' } for the iOS preset %p", (target) => {
    expect(classifyTarget(target)).toEqual({ kind: "ios" });
  });

  it("should return { kind: 'unsupported' } for an Electron target", () => {
    expect(classifyTarget("Electron")).toEqual({ kind: "unsupported" });
  });

  it("should return { kind: 'unsupported' } for a Basic (legacy) target", () => {
    expect(classifyTarget("Basic")).toEqual({ kind: "unsupported" });
  });

  it.each(["Windows 11 - Desktop", "macOS - Any Mac (Latest)"])(
    "should return { kind: 'unsupported' } for the desktop preset %p",
    (target) => {
      expect(classifyTarget(target)).toEqual({ kind: "unsupported" });
    },
  );

  it("should return { kind: 'unrecognized' } for an unrecognised target string (e.g. a typo)", () => {
    expect(classifyTarget("not-a-real-target")).toEqual({
      kind: "unrecognized",
    });
  });
});

describe("isAndroidTarget", () => {
  it("should return true when target platform is android", () => {
    expect(isAndroidTarget("Android - Pixel")).toBe(true);
  });

  it("should return true for an 'Any Phone' emulator target", () => {
    expect(isAndroidTarget("Android - Any Phone (Latest | Emulator)")).toBe(
      true,
    );
  });

  it("should return false for a physical Android phone target", () => {
    expect(isAndroidTarget("Android - Samsung Galaxy A17 (Android 16)")).toBe(
      false,
    );
  });

  it("should return false when target platform is web", () => {
    expect(isAndroidTarget("Web - Chrome")).toBe(false);
  });

  it("should return false when target platform is iOS", () => {
    expect(isAndroidTarget("iOS - iPad")).toBe(false);
  });

  it("should return false for an unrecognised target string", () => {
    expect(isAndroidTarget("not-a-real-target")).toBe(false);
  });
});
