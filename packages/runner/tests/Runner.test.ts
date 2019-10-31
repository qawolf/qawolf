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

  it("asserts text on page", async () => {
    const runner = await Runner.create({
      ...loginWorkflow,
      url: `${CONFIG.testUrl}login`
    });

    const hasText = await runner.hasText("tomsmith");

    expect(hasText).toBe(true);

    await runner.close();
  });

  it("gets property of element", async () => {
    const runner = await Runner.create({
      ...loginWorkflow,
      url: `${CONFIG.testUrl}dropdown`
    });

    const id = await runner.getElementProperty("select", "id");

    expect(id).toBe("dropdown");

    await runner.close();
  });
});
