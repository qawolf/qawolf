import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { Server } from "./Server";

let browser: Browser;
let server: Server;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch();
  await browser._browser!.url(CONFIG.testUrl);
  server = new Server();
});

afterAll(() => browser.close());

test("injectClient creates a Client in the Browser and resolves a Connection to it", async () => {
  const connection = await server.injectClient(browser);
  expect(connection).toBeTruthy();
});
