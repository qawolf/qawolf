import { CONFIG, makeTempDir } from "@qawolf/config";
import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { pathExists, remove } from "fs-extra";
import { Runner } from "../../src/Runner";

let loginWorkflow: Workflow;

beforeAll(async () => {
  loginWorkflow = await loadWorkflow("scroll_login");
});

it("records dom replayer and a video", async () => {
  CONFIG.domPath = await makeTempDir();
  CONFIG.videoPath = await makeTempDir();

  const runner = await Runner.create({
    ...loginWorkflow,
    size: "mobile",
    url: CONFIG.testUrl
  });
  await sleep(500);
  await runner.close();

  const videoPath = `${CONFIG.videoPath}/${loginWorkflow.name}`;
  expect(await pathExists(`${videoPath}/video.mp4`)).toBeTruthy();
  expect(await pathExists(`${videoPath}/video.gif`)).toBeTruthy();
  await remove(CONFIG.videoPath);

  // 668 instead of 667 since it rounds up to even numbers
  expect(runner.screenCapture!.size).toMatchObject({
    height: 668,
    width: 376
  });

  const domPath = `${CONFIG.domPath}/${loginWorkflow.name}`;
  expect(await pathExists(`${domPath}/page_0.html`)).toBeTruthy();
});
