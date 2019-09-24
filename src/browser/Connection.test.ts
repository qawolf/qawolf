import { createBrowser } from "./browserUtils";
import { CONFIG } from "../config";
import { createConnection } from "./createConnection";
import { Server } from "./Server";

test("request receives a response", async () => {
  const server = new Server();
  const serverReady = server.listen();
  const browser = await createBrowser(CONFIG.testUrl);
  await serverReady;

  const connection = await createConnection({ browser, server });
  const response = await connection.request("version");
  expect(response).toEqual("0.0.1");

  await browser.closeWindow();
  server.close();
});
