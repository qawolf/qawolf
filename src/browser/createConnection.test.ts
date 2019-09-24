import { createBrowser } from "./browserUtils";
import { Server } from "./Server";
import { createConnection } from "./createConnection";

test("createConnection creates a Connection with a socket to the client", async () => {
  const server = new Server();
  await server.listen();

  const browser = await createBrowser();
  const connection = await createConnection({
    browser,
    id: "0",
    server
  });
  expect(connection._socket).toBeTruthy();

  await browser.closeWindow();
  server.close();
});
