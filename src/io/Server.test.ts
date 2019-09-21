import { Server } from "./Server";
import SocketIO from "socket.io-client";

test("onConnection resolves a socket", async () => {
  const server = new Server();
  await server.listen();

  const socketPromise = server.onConnection("testId");

  const connection = SocketIO(`http://127.0.0.1:${server.port}`, {
    query: { id: "testId" }
  });

  const socket = await socketPromise;
  expect(socket).toBeTruthy();

  connection.close();
  server.close();
});
