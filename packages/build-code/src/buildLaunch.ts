export const buildLaunch = (url: string, device?: string): string => {
  if (device) {
    return `await launch({ device: "${device}", url: "${url}" });`;
  }

  return `await launch({ url: "${url}" });`;
};
