import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { Server } from "./Server";
import { Connection } from "./Connection";

let connection: Connection;
let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch();
  await browser._browser!.url(CONFIG.testUrl);
  const server = new Server();
  connection = await server.injectClient(browser);
});

afterAll(() => browser.close());

test("Connection responds to a method invokation", async () => {
  const version = await connection.method("version");
  expect(version).toEqual("0.0.1");
});
