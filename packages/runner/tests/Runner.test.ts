import { $xText } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { Runner } from "../src/Runner";

// import directly since fixtures are note exported from @qawolf/build-job
import { loginJob } from "../../build-job/fixtures/loginJob";

it("runs a job", async () => {
  const runner = await Runner.create({
    ...loginJob,
    url: CONFIG.testUrl
  });
  await runner.run();

  const page = await runner.browser.currentPage();
  const text = await $xText(page, '//*[@id="content"]/div/h2');
  expect(text).toEqual(" Secure Area");

  await runner.close();
}, 10000);
