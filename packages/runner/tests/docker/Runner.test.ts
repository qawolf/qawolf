import { CONFIG, makeTempDir } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists, remove } from "fs-extra";
import { Runner } from "../../src/Runner";
// import directly since fixtures are note exported from @qawolf/build-job
import { loginJob } from "../../../build-job/fixtures/loginJob";

it("records a video for the browser size", async () => {
  CONFIG.videoPath = await makeTempDir();

  const runner = await Runner.create({
    ...loginJob,
    size: "mobile",
    url: CONFIG.testUrl
  });
  await sleep(500);
  await runner.close();

  const savePath = `${CONFIG.videoPath}/${loginJob.name}`;
  expect(await pathExists(`${savePath}/video.mp4`)).toBeTruthy();
  expect(await pathExists(`${savePath}/video.gif`)).toBeTruthy();
  await remove(CONFIG.videoPath);

  // 668 instead of 667 since Recorder rounds up to even numbers
  expect(runner.recorder!.size).toMatchObject({ height: 668, width: 376 });
});
