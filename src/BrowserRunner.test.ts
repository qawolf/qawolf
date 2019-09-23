import { BrowserRunner } from "./BrowserRunner";
import { CONFIG } from "./config";
import { Server } from "./io/Server";
import { BrowserStep, Job } from "./types";

let server: Server;

beforeAll(async () => {
  server = new Server();
  await server.listen();
});

afterAll(() => server.close());

test("Runner runs job", async () => {
  const runner = await new BrowserRunner({ server });
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
  await runner.run(job);

  const header = await runner._browser._browser!.$('//*[@id="content"]/div/h2');
  expect(await header.getText()).toEqual("Secure Area");
  await runner.close();
}, 10000);
