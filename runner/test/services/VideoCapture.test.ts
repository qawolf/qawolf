// Xvfb :0 -screen 0 1288x1180x24 -listen tcp &
// DEBUG=qawolf* npm run test VideoCapture
import { existsSync } from "fs";
import { platform } from "os";

import { VideoCapture } from "../../src/services/VideoCapture";

describe("VideoCapture", () => {
  it("creates a video and gif", async () => {
    if (platform() !== "linux") return;

    const capture = new VideoCapture();
    await capture.start();
    await capture.stop();
    expect(existsSync(capture.videoPath)).toBeTruthy();

    await capture.createGif();
    expect(existsSync(capture.gifPath)).toBeTruthy();
  });
});
