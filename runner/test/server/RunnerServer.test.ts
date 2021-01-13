import axios from "axios";

import { RunnerServer } from "../../src/server/RunnerServer";

const port = 3998;
const serverUrl = `http://localhost:${port}`;

describe("RunnerServer", () => {
  let server: RunnerServer;

  beforeAll(async () => {
    server = await RunnerServer.start(port);
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
