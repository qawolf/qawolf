import axios from "axios";

import config from "../../src/config";
import { RunnerServer } from "../../src/server/RunnerServer";

config.SERVER_PORT = 3998;
const serverUrl = `http://localhost:${config.SERVER_PORT}`;

describe("RunnerServer", () => {
  let server: RunnerServer;

  beforeAll(async () => {
    server = await RunnerServer.start();
  });

  afterAll(async () => {
    await server.close();
  });

  describe("start", () => {
    it("creates a SocketServer", () => {
      expect(server._socketServer).toBeTruthy();
    });
  });

  describe("/status", () => {
    it("returns 200", async () => {
      const res = await axios.get(`${serverUrl}/status`);
      expect(res.status).toBe(200);
    });
  });
});
