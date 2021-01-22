import cors from "cors";
import Debug from "debug";
import express from "express";
import { createServer, Server as HttpServer } from "http";

import config from "../config";
import { Runner } from "../runner/Runner";
import { SocketServer } from "./SocketServer";

const debug = Debug("qawolf:RunnerServer");

export class RunnerServer {
  static async start(
    port = config.INTERNAL_SERVER_PORT
  ): Promise<RunnerServer> {
    const server = new RunnerServer();

    server._socketServer = new SocketServer({
      apiKey: config.RUNNER_API_KEY,
      httpServer: server._httpServer,
      runner: server._runner,
    });

    await new Promise((resolve) => {
      server._httpServer.listen(port, () => {
        debug("listening on %s", port);
        resolve(null);
      });
    });

    return server;
  }

  readonly _app = express();
  readonly _httpServer: HttpServer;
  readonly _runner = new Runner();

  _socketServer?: SocketServer;

  constructor() {
    this._app.use(cors());
    this._app.use(express.json());

    this._httpServer = createServer(this._app);

    this._app.get("/status", (_, res) => res.sendStatus(200));
  }

  async close(): Promise<void> {
    debug("close");

    await Promise.all([
      this._socketServer?.close(),
      new Promise((resolve) => this._httpServer.close(resolve)),
      this._runner.close(),
    ]);
  }
}
