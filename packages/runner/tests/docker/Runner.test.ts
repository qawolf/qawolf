import { CONFIG, makeTempDir } from "@qawolf/config";
import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { pathExists, remove } from "fs-extra";
import { Runner } from "../../src/Runner";

let workflow: Workflow;

beforeAll(async () => {
  workflow = await loadWorkflow("click_input");
});

it("records dom replayer and a video", async () => {
  CONFIG.domPath = await makeTempDir();
  CONFIG.videoPath = await makeTempDir();

  const runner = await Runner.create({
    ...workflow,
    size: "mobile",
    url: `${CONFIG.testUrl}login`
  });
  await sleep(500);
  await runner.close();

  const videoPath = `${CONFIG.videoPath}/${workflow.name}`;
  expect(await pathExists(`${videoPath}/video.mp4`)).toBeTruthy();
  expect(await pathExists(`${videoPath}/video.gif`)).toBeTruthy();
  await remove(CONFIG.videoPath);

  // 668 instead of 667 since it rounds up to even numbers
  expect(runner.screenCapture!.size).toMatchObject({
    height: 668,
    width: 376
  });

  const domPath = `${CONFIG.domPath}/${workflow.name}`;
  expect(await pathExists(`${domPath}/page_0.html`)).toBeTruthy();
});
