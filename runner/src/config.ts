const config = {
  API_URL: process.env.QAWOLF_API_URL || "https://app.qawolf.com/api",
  // 720 viewport + 84 chrome
  DISPLAY_HEIGHT: process.env.QAWOLF_DISPLAY_HEIGHT || 804,
  // 1280 viewport + 8 scrollbar
  DISPLAY_WIDTH: process.env.QAWOLF_DISPLAY_WIDTH || 1288,
  FFMPEG_PATH: process.env.FFMPEG_PATH || "/usr/bin/ffmpeg",
  RECORDER_SCRIPT_FILENAME: "qawolf.recorder.js",
  SERVER_PORT: process.env.SERVER_PORT || 4000,
};

export default config;
