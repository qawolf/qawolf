import { Browser } from "./Browser";
import { CONFIG } from "./config";
import { Server } from "./io/Server";
import { Runner } from "./Runner";
import { BrowserAction, Workflow } from "./types";
import { sleep } from "./utils";

(async () => {
  const steps: BrowserAction[] = [
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

  const workflow: Workflow = {
    href: `${CONFIG.testUrl}/login`,
    steps
  };
  const server = new Server();
  await server.listen();

  const takeScreenshot = async (browser: Browser) => {
    await sleep(5000);
    await browser._browser!.saveScreenshot(`./tmp/${Date.now()}.png`);
  };

  const callbacks = {
    onStepBegin: [takeScreenshot],
    onWorkflowEnd: [takeScreenshot]
  };

  const runner = new Runner({ callbacks, server });
  await runner.run(workflow);
})();
