export const getPath = (): string | null => {
  const isInstalled = require.resolve("ffmpeg-static");
  if (!isInstalled) return null;

  const ffmpegPath = require("ffmpeg-static");
  return ffmpegPath;
};
