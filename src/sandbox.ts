import { Browser } from "./Browser";
import { BrowserRunner } from "./BrowserRunner";
import { CONFIG } from "./config";
import { Server } from "./io/Server";
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

  const takeScreenshot = async (runner: BrowserRunner) => {
    await sleep(1000);
    await runner._browser._browser!.saveScreenshot(`./tmp/${Date.now()}.png`);
  };

  const callbacks = {
    onStepBegin: [takeScreenshot],
    onWorkflowEnd: [takeScreenshot]
  };

  const runner = new BrowserRunner({ callbacks, server });
  await runner.runWorkflow(workflow);
})();
