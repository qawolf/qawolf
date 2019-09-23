import { Server } from "./Server";
import SocketIO from "socket.io-client";

test("onConnection resolves a socket", async () => {
  const server = new Server();
  await server.listen();

  const socketPromise = server.onConnection("testId");

  const connection = SocketIO(`https://localhost:${server.port}`, {
    query: { id: "testId" },
    rejectUnauthorized: false
  });

  const socket = await socketPromise;
  expect(socket).toBeTruthy();

  connection.close();
  server.close();
});
