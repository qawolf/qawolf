import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import playwright from "playwright";
import { connect } from "../../src/context/connect";

describe("connect", () => {
  it("injects qawolf", async () => {
    const browserServer = await playwright[CONFIG.browser].launchServer();
    const wsEndpoint = browserServer.wsEndpoint()!;

    const context = await connect({ wsEndpoint });

    const isLoaded = () => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return !!qawolf;
    };

    const pageZero = await context.page({ page: 0 });
    const zeroIsLoaded = await pageZero.evaluate(isLoaded);
    expect(zeroIsLoaded).toBeTruthy();

    // check it loads on a new page
    await context.newPage();
    const pageOne = await context.page({ page: 1 });
    const oneIsLoaded = await pageOne.evaluate(isLoaded);
    expect(oneIsLoaded).toBeTruthy();

    await context.close();

    await browserServer.close();
  });
});
