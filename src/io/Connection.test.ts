import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { Server } from "./Server";
import { Connection } from "./Connection";

let browser: Browser;
let connection: Connection;
let server: Server;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch();
  await browser._browser!.url(CONFIG.testUrl);
  server = new Server();
});

afterAll(() => browser.close());

test("connect resolves a soket", async () => {
  connection = new Connection({ browser, server });
  await connection.connect();
  expect(connection._socket).toBeTruthy();
});

test("Connection receives a method result", async () => {
  const result = await connection.method("version");
  expect(result).toEqual("0.0.1");
});
