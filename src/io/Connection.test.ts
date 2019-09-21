import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { Connection } from "./Connection";
import { Server } from "./Server";

let browser: Browser;
let server: Server;

beforeAll(async () => {
  browser = new Browser();
  server = new Server();
  await browser.launch();
});

afterAll(async () => {
  server.close();
  await browser.close();
});

const createConnection = async () => {
  await browser._browser!.url(CONFIG.testUrl);
  const connection = new Connection({ browser, server });
  await connection.connect();
  return connection;
};

test("connect creates a socket", async () => {
  const connection = await createConnection();
  expect(connection._socket).toBeTruthy();
  connection.close();
  expect(connection._socket).toBeFalsy();
});

test("request receives a response", async () => {
  const connection = await createConnection();

  const response = await connection.request("version");
  expect(response).toEqual("0.0.1");

  connection.close();
});

test("reconnects on page change", async () => {
  const connection = await createConnection();

  const initialSocketId = connection._socket!.id;
  expect(connection._socket).toBeTruthy();
  await browser._browser!.url(CONFIG.testUrl);

  // send another request which will not resolve
  // until reconnect the new page's Client connects
  const response = await connection.request("version");
  expect(response).toEqual("0.0.1");

  // check the socket id changed
  expect(connection._socket!.id).not.toEqual(initialSocketId);
  connection.close();
});

test("gracefully handles redirects", async () => {
  const connection = await createConnection();

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

  // check we arrive at the correct page
  const header = await browser._browser!.$('//*[@id="content"]/div/h3');
  expect(await header.getText()).toEqual("Status Codes");
  connection.close();
});
