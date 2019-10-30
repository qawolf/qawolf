import { $xText } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { Runner } from "../src/Runner";

// import directly since fixtures are note exported from @qawolf/build-workflow
import { loginWorkflow } from "../../build-workflow/fixtures/loginWorkflow";

describe("Runner", () => {
  it("runs a workflow", async () => {
    const runner = await Runner.create({
      ...loginWorkflow,
      url: CONFIG.testUrl
    });
    await runner.run();

    const page = await runner.browser.currentPage();
    const text = await $xText(page, '//*[@id="content"]/div/h2');
    expect(text).toEqual("Secure Area");

    await runner.close();
  });

  it("asserts text on page", async () => {
    const runner = await Runner.create({
      ...loginWorkflow,
      url: `${CONFIG.testUrl}login`
    });

    const hasText = await runner.hasText("tomsmith");

    expect(hasText).toBe(true);

    await runner.close();
  });
});
