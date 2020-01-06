const { execSync } = require("child_process");
const os = require("os");

const platform = os.platform();

if (platform === "linux") {
  // TODO resolve https://github.com/eugeneware/ffmpeg-static/issues/20
  // no-package-lock to prevent overriding symlinks in bootstrap
  execSync("npm install --no-package-lock --no-save ffmpeg-static@3.0.0", {
    stdio: [0, 1, 2]
  });
}
