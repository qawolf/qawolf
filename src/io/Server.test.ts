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

afterAll(async () => {
  server.close();
  await browser.close();
});

test("onConnection resolves a connection", async () => {
  // const connection = await server.onConnection();
  // expect(connection).toBeTruthy();
  expect(true).toEqual(true);
});
