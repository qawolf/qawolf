import { Browser } from "./Browser";
import { BrowserRunner } from "./BrowserRunner";
import { CONFIG } from "./config";
import { Server } from "./io/Server";
import { BrowserStep, Job } from "./types";
import { sleep } from "./utils";

(async () => {
  const steps: BrowserStep[] = [
    {
      selector: {
        xpath: '//*[@id="username"]'
      },
      type: "type",
      value: "tomsmith"
    },
    {
      selector: {
        xpath: '//*[@id="password"]'
      },
      type: "type",
      value: "SuperSecretPassword!"
    },
    {
      selector: {
        xpath: '//*[@id="login"]/button'
      },
      type: "click"
    }
  ];

  const job: Job = {
    href: `${CONFIG.testUrl}/login`,
    steps
  };
  const server = new Server();
  await server.listen();

  const takeScreenshot = async (runner: BrowserRunner) => {
    await sleep(1000);
    await runner._browser._browser!.saveScreenshot(`./tmp/${Date.now()}.png`);
  };

  const callbacks = {
    beforeStep: [takeScreenshot],
    afterRun: [takeScreenshot]
  };

  const runner = new BrowserRunner({ callbacks, server });
  await runner.run(job);
})();
