import { CONFIG } from "../config";
import { redirectJob } from "../fixtures/job";
import { Pool } from "./Pool";
import { Server } from "./Server";

const server = new Server();

beforeAll(() => server.listen());

afterAll(() => {
  server.close();
});

test("creates a connection per window", async () => {
  const pool = new Pool({ server, url: CONFIG.testUrl });
  await pool.create();
  await pool.getConnection(0);
  expect(pool._connections.length).toEqual(1);

  await pool.browser.newWindow(`${CONFIG.testUrl}/login`, "1");
  // ensure calling getConnection multiple times
  // does not create duplicate connections
  await pool.getConnection(1);
  await pool.getConnection(1);
  await pool.getConnection(1);
  expect(pool._connections.length).toEqual(2);

  // we only allow creating one missing window connection at a time
  // to make it easy to associate commands with windows
  // based on their order of creation
  await expect(pool.getConnection(2)).rejects.toEqual(
    new Error("0 missing connections. Must equal 1")
  );

  await pool.browser.newWindow(CONFIG.testUrl, "2");
  await pool.browser.newWindow(CONFIG.testUrl, "3");
  await expect(pool.getConnection(2)).rejects.toEqual(
    new Error("2 missing connections. Must equal 1")
  );

  await pool.close();
});

test("replaces a connection when the browser navigates", async () => {
  const pool = new Pool({ server, url: redirectJob.href });
  await pool.create();

  let connection = await pool.getConnection(0);

  const initialSocketId = connection._socket.id;

  // click link to force redirect
  await connection.runStep(redirectJob.steps[0]);

  // click another link and check we ended up at the right place
  await connection.runStep(redirectJob.steps[1]);
  const header = await pool.browser.$('//*[@id="content"]/div/h3');
  expect(await header.getText()).toEqual("Status Codes");

  // make sure the socket was replaced
  connection = await pool.getConnection(0);
  expect(connection._socket.id).not.toEqual(initialSocketId);

  await pool.close();
});
