export const getPath = (): string | null => {
  const isInstalled = require.resolve("@qawolf/ffmpeg-static");
  if (!isInstalled) return null;

  const ffmpegPath = require("@qawolf/ffmpeg-static");
  return ffmpegPath;
};
