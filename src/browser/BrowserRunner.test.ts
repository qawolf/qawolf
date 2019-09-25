import { BrowserRunner } from "./BrowserRunner";
import { redirectJob } from "../fixtures/job";

test("BrowserRunner re-runs steps after navigation", async () => {
  const runner = new BrowserRunner();
  await runner.run(redirectJob);

  const page = runner.currentPage;
  await page.waitForNavigation();
  const header = await page.$x('//*[@id="content"]/div/h3');
  const text = await page.evaluate(element => element.textContent, header[0]);
  expect(text).toEqual("Status Codes");
  await runner.close();
}, 10000);

// TODO add multiple window job test...
