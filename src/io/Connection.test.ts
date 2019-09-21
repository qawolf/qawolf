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

// afterAll(() => browser.close());

test("connect() resolves a socket", async () => {
  connection = new Connection({ browser, server });
  await connection.connect();
  expect(connection._socket).toBeTruthy();
});

test("request() receives a response", async () => {
  const response = await connection.request("version");
  expect(response).toEqual("0.0.1");
});

test("reconnects on page change", async () => {
  await connection.run({
    type: "click",
    target: {
      xpath: '//*[@id="content"]/ul/li[32]/a'
    }
  });

  await connection.run({
    type: "click",
    target: {
      xpath: '//*[@id="redirect"]'
    }
  });
  // TODO check the socket gets recreated...
});

test("resends messages in progress after reconnect", async () => {
  // TODO....
  // await connection.run({
  //   type: "click",
  //   target: {
  //     xpath: '//*[@id="redirect"]'
  //   }
  // });
});
