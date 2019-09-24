import { BrowserRunner } from "./BrowserRunner";
import { loginJob } from "./fixtures/job";
import { Server } from "./io/Server";

let server: Server;

beforeAll(async () => {
  server = new Server();
  await server.listen();
});

afterAll(() => server.close());

test("Runner runs job", async () => {
  const runner = await new BrowserRunner({ server });
  await runner.run(loginJob);

  const header = await runner._browser._browser!.$('//*[@id="content"]/div/h2');
  expect(await header.getText()).toEqual("Secure Area");
  await runner.close();
}, 10000);
