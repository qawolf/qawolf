import { CONFIG, makeTempDir } from "@qawolf/config";
import { sleep } from "@qawolf/web";
import { pathExists, remove } from "fs-extra";
// import directly since fixtures are not exported
import { loginWorkflow } from "../../../build-workflow/fixtures/loginWorkflow";
import { Runner } from "../../src/Runner";

it("records dom replayer and a video", async () => {
  CONFIG.videoPath = await makeTempDir();

  const runner = await Runner.create({
    ...loginWorkflow,
    size: "mobile",
    url: CONFIG.testUrl
  });
  await sleep(500);
  await runner.close();

  const savePath = `${CONFIG.videoPath}/${loginWorkflow.name}`;
  expect(await pathExists(`${savePath}/video.mp4`)).toBeTruthy();
  expect(await pathExists(`${savePath}/video.gif`)).toBeTruthy();
  await remove(CONFIG.videoPath);

  // 668 instead of 667 since it rounds up to even numbers
  expect(runner.screenCapture!.size).toMatchObject({
    height: 668,
    width: 376
  });

  expect(await pathExists(`${savePath}/page_0.html`)).toBeTruthy();
});
