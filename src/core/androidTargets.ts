import {
  getAndroidDeviceMode,
  parseExecutionTarget,
} from "@qawolf/flow-targets";

// The cloud picks a device for these models at claim time, so avdmanager has
// no device definition for them. Locally they get the Pixel the cloud's
// emulator templates use.
const avdDeviceIdByModel: Readonly<Record<string, string>> = {
  any_phone: "pixel_9",
  any_tablet: "pixel_tablet",
};

/** The `avdmanager create avd -d` device id for a flow-targets device model. */
export function avdDeviceId(deviceModel: string): string {
  return avdDeviceIdByModel[deviceModel] ?? deviceModel;
}

export function makeAvdName(
  deviceModel: string,
  androidVersion: string,
): string {
  const device = avdDeviceId(deviceModel).toLowerCase().replace(/ /g, "_");
  return `qawolf_${device}_api${androidVersion}`;
}

// `parseExecutionTarget`'s param is the strict preset-literal union, but it
// validates `unknown` at runtime via Zod. Cast so we can hand it any string
// and use the try/catch to reject non-targets.
type ParseArg = Parameters<typeof parseExecutionTarget>[0];

export function avdNameForTarget(target: string): string | undefined {
  let parsed: ReturnType<typeof parseExecutionTarget>;
  try {
    parsed = parseExecutionTarget(target as ParseArg);
  } catch {
    return undefined;
  }
  if (parsed.platform !== "android") return undefined;
  const { deviceModel, androidVersion } = parsed.meta;
  // Physical farm phones have no emulator image.
  if (getAndroidDeviceMode(deviceModel) === "real") return undefined;
  return makeAvdName(deviceModel, androidVersion);
}

const avdArchByNodeArch: Partial<Record<NodeJS.Architecture, string>> = {
  arm64: "arm64-v8a",
  x64: "x86_64",
};

export function buildSystemImage(
  androidVersion: string,
  arch: NodeJS.Architecture,
): string {
  const archStr = avdArchByNodeArch[arch];
  if (!archStr) {
    throw new Error(`Unsupported host architecture for Android AVD: ${arch}`);
  }
  // API 36 has no Play Store system image; use google_apis instead.
  const imageType =
    Number(androidVersion) >= 36 ? "google_apis" : "google_apis_playstore";
  // Since Android 17 the SDK publishes system images per minor platform
  // release (android-37.0, android-37.1, ...); google_apis ships with the first.
  const platformId =
    Number(androidVersion) >= 37 ? `${androidVersion}.0` : androidVersion;
  return `system-images;android-${platformId};${imageType};${archStr}`;
}
