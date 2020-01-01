const { execSync } = require("child_process");
const os = require("os");

const platform = os.platform();

if (platform === "linux") {
  // TODO resolve https://github.com/eugeneware/ffmpeg-static/issues/20
  execSync("npm install --no-save ffmpeg-static@3.0.0", { stdio: [0, 1, 2] });
}
