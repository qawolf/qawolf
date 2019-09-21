import { Server } from "./Server";
import SocketIO from "socket.io-client";

test("onConnection resolves a socket", async () => {
  const server = new Server();

  const socketPromise = server.onConnection("testId");

  // XXX TODO change this depending on location
  const connection = SocketIO("http://localhost:3000", {
    query: { id: "testId" }
  });
  const socket = await socketPromise;

  expect(socket).toBeTruthy();

  connection.close();
  server.close();
});
