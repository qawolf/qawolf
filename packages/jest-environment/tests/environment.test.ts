import { $xText } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";

describe("RunnerEnvironment", () => {
  it("exposes a runner and actions as globals", () => {
    expect(runner).toBeTruthy();
    expect(click).toBeTruthy();
    expect(input).toBeTruthy();
    expect(scroll).toBeTruthy();
  });

  it("exposes job, steps and values as globals", () => {
    expect(job.url).toEqual(CONFIG.testUrl);
    expect(steps.length).toEqual(7);
    expect(values.length).toEqual(7);
  });

  it("exposes browser, currentPage, and getPage as globals", async () => {
    expect(browser).toEqual(runner.browser);
    expect(getPage).toBeTruthy();

    const page = await currentPage();
    expect(page).toBeTruthy();
    expect(page.url()).toEqual(CONFIG.testUrl);
  });

  it("runs a job", async () => {
    await runner.run();

    const page = await currentPage();
    const text = await $xText(page, '//*[@id="content"]/div/h2');
    expect(text).toEqual(" Secure Area");
  });
});
