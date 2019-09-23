import { CONFIG } from "./config";
import { Server } from "./io/Server";
import { Runner } from "./Runner";
import { BrowserAction, Workflow } from "./types";

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

  const runner = new Runner(server);
  await runner.run(workflow);
})();
