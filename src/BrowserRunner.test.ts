import { BrowserRunner } from "./BrowserRunner";
import { Server } from "./browser/Server";
import { loginJob } from "./fixtures/job";

let server: Server;

beforeAll(async () => {
  server = new Server();
  await server.listen();
});

afterAll(() => server.close());

test("Runner runs job", async () => {
  const runner = new BrowserRunner({ server });
  await runner.run(loginJob);

  const header = await runner._pool.browser.$('//*[@id="content"]/div/h2');
  expect(await header.getText()).toEqual("Secure Area");
  await runner.close();
}, 10000);
