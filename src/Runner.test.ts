import { CONFIG } from "./config";
import { Server } from "./io/Server";
import { Runner } from "./Runner";
import { Workflow, BrowserAction } from "./types";

let server: Server;

beforeAll(async () => {
  server = new Server();
  await server.listen();
});

afterAll(() => server.close());

test("Runner runs workflow", async () => {
  const runner = await new Runner(server);
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
  await runner.run(workflow);

  const header = await runner._browser._browser!.$('//*[@id="content"]/div/h2');
  expect(await header.getText()).toEqual("Secure Area");
  await runner.close();
});
