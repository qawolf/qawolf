import waitUntil from "async-wait-until";
import { createServer } from "http";
import io, { Socket } from "socket.io-client";

import { Runner } from "../../src/runner/Runner";
import { SocketServer } from "../../src/server/SocketServer";
import { RunProgress } from "../../src/types";

const port = 3999;
const serverUrl = `http://localhost:${port}`;

describe("SocketServer", () => {
  let runner: Runner;
  let server: SocketServer;
  let socket: typeof Socket;

  beforeAll(async () => {
    const httpServer = createServer();

    runner = new Runner();
    await runner._createEnvironment();
    server = new SocketServer({ httpServer, runner });
    await new Promise((resolve) =>
      httpServer.listen({ port }, () => resolve(null))
    );

    socket = io(serverUrl, {
      transports: ["websocket"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    socket.connect();
    await waitUntil(() => socket.connected);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    socket.close();
    await Promise.all([runner.close(), server.close()]);
  });

  describe("socket disconnects", () => {
    let disconnectSpy: jest.SpyInstance;
    let emitUsersSpy: jest.SpyInstance;

    beforeAll(async () => {
      disconnectSpy = jest.spyOn(server._subscriptions, "disconnect");
      emitUsersSpy = jest.spyOn(server._subscriptions, "disconnect");

      socket.disconnect();
      await waitUntil(() => socket.disconnected);
    });

    afterAll(async () => {
      socket.connect();
      await waitUntil(() => socket.connected);
    });

    it("disconnects the subscription", async () => {
      expect(disconnectSpy).toBeCalled();
    });

    it("emits users", async () => {
      expect(emitUsersSpy).toBeCalled();
    });
  });

  describe("socket emits run", () => {
    it("invokes runner run", async () => {
      const message = { code: "" };
      const spy = jest.spyOn(server._runner, "run").mockImplementation();
      socket.emit("run", message);
      await waitUntil(() => spy.mock.calls.length > 0);
      expect(spy).toBeCalledWith(message);
      spy.mockRestore();
    });
  });

  describe("socket emits stop", () => {
    it("invokes runner stop", async () => {
      const runnerStopSpy = jest
        .spyOn(server._runner, "stop")
        .mockImplementation();
      const subscriptionsEmitSpy = jest.spyOn(server._subscriptions, "emit");
      socket.emit("stop");
      await waitUntil(() => runnerStopSpy.mock.calls.length > 0);
      expect(runnerStopSpy).toBeCalledTimes(1);

      expect(subscriptionsEmitSpy).toBeCalledTimes(1);
      expect(subscriptionsEmitSpy).toBeCalledWith("run", {
        data: null,
        event: "runstopped",
      });

      runnerStopSpy.mockRestore();

      subscriptionsEmitSpy.mockRestore();
    });
  });

  describe("socket emits subscribe", () => {
    it("registers the subscription", async () => {
      const spy = jest.spyOn(server._subscriptions, "subscribe");

      socket.emit("subscribe", { type: "code" });
      await waitUntil(() => spy.mock.calls.length > 0);

      expect(spy.mock.calls[0][1]).toEqual({ type: "code" });
    });

    it("sends chooser value", async () => {
      runner._environment?.elementChooser._setActive(true);
      const spy = jest.fn();
      socket.on("elementchooser", spy);
      socket.emit("subscribe", { type: "elementchooser" });
      await waitUntil(() => spy.mock.calls.length > 0);
      expect(spy.mock.calls[0][0]).toEqual({ isActive: true });
    });

    it("sends initial logs", async () => {
      const spy = jest.fn();
      socket.on("logs", spy);
      socket.emit("subscribe", { type: "logs" });
      await waitUntil(() => spy.mock.calls.length > 0);
      expect(spy.mock.calls[0][0]).toEqual(server._runner.logs);
    });

    it("sends current run progress", async () => {
      const progress: RunProgress = {
        code: "",
        completed_at: null,
        current_line: 1,
        status: "created",
      };

      const progressMock = jest
        .spyOn(runner, "progress")
        .mockReturnValue(progress);

      const spy = jest.fn();
      socket.on("runprogress", spy);

      socket.emit("subscribe", { type: "run" });
      await waitUntil(() => spy.mock.calls.length > 0);

      expect(spy.mock.calls[0][0]).toEqual(progress);

      progressMock.mockRestore();
    });

    it("sends current users", async () => {
      const spy = jest.fn();
      socket.on("users", spy);

      const user = {
        email: "spirit@qawolf.com",
        wolfName: "Spirit",
        wolfVariant: "black",
      };

      socket.emit("subscribe", {
        type: "users",
        data: user,
      });

      await waitUntil(() => spy.mock.calls.length > 0);
      expect(spy.mock.calls[0][0]).toEqual([user]);
    });
  });

  it("publishes runner events", () => {
    const spy = jest.spyOn(server._subscriptions, "emit");
    spy.mockClear();

    const data = { example: 1 };
    runner.emit("elementchooser", data);
    runner.emit("logs", data);
    runner.emit("logscreated", data);
    runner.emit("runprogress", data);

    expect(spy.mock.calls).toEqual([
      ["elementchooser", { data, event: "elementchooser" }],
      ["logs", { data, event: "logs" }],
      ["logs", { data, event: "logscreated" }],
      ["run", { data, event: "runprogress" }],
    ]);
  });
});
