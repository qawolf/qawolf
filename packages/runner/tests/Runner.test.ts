import { hasText } from "@qawolf/browser";
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
    const hasSecureText = await hasText(page, "Secure Area");
    expect(hasSecureText).toBe(true);

    await runner.close();
  });
});
