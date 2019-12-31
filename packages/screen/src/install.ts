import { execSync } from "child_process";
import os from "os";

const platform = os.platform();

// if (platform === "linux") {
// TODO resolve https://github.com/eugeneware/ffmpeg-static/issues/20
execSync("npm install ffmpeg-static@3.0.0", { stdio: [0, 1, 2] });
// }
