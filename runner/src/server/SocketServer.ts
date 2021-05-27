import Debug from "debug";
import type { EventEmitter } from "events";
import { Server as HttpServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";

import { Runner } from "../runner/Runner";
import {
  SubscribeMessage,
  SubscribeType,
  SubscriptionTracker,
} from "./SubscriptionTracker";

type Auth = {
  apiKey: string;
};

type ConstructorOptions = {
  apiKey?: string;
  httpServer: HttpServer;
  runner: Runner;
};

const debug = Debug("qawolf:SocketServer");

export class SocketServer {
  readonly _apiKey?: string;
  readonly _io: SocketIoServer;
  readonly _runner: Runner;
  readonly _subscriptions = new SubscriptionTracker();

  constructor({ apiKey, httpServer, runner }: ConstructorOptions) {
    this._apiKey = apiKey;
    this._runner = runner;
    this._io = new SocketIoServer(httpServer, { transports: ["websocket"] });
    this._io.on("connect", this._onConnect.bind(this));

    this._publish(this._runner, {
      event: "elementchooser",
      to: "elementchooser",
    });
    this._publish(this._runner, { event: "logs", to: "logs" });
    this._publish(this._runner, { event: "logscreated", to: "logs" });
    this._publish(this._runner, { event: "runprogress", to: "run" });
  }

  _authenticate(socket: Socket): boolean {
    return (
      this._apiKey === undefined ||
      this._apiKey === (socket.handshake.auth as Auth)?.apiKey
    );
  }

  _onConnect(socket: Socket): void {
    if (!this._authenticate(socket)) {
      debug(`socket unauthorized ${socket.id}`);
      socket.disconnect();
      return;
    }

    debug(`socket connected ${socket.id}`);
    socket.on("disconnect", () => this._onDisconnect(socket));
    socket.on("run", (message) => this._runner.run(message));
    socket.on("startelementchooser", () => this._runner.startElementChooser());
    socket.on("stop", async () => {
      this._subscriptions.emit("run", { data: null, event: "runstopped" });
      await this._runner.stop();
    });
    socket.on("stopelementchooser", () => this._runner.stopElementChooser());
    socket.on("subscribe", (message) => this._onSubscribe(socket, message));
    socket.on("unsubscribe", (message) => this._onUnsubscribe(socket, message));
  }

  _onDisconnect(socket: Socket): void {
    debug(`socket disconnected ${socket.id}`);
    this._subscriptions.disconnect(socket);
  }

  _onSubscribe(socket: Socket, message: SubscribeMessage): void {
    this._subscriptions.subscribe(socket, message);

    const { type } = message;
    if (type === "elementchooser") {
      const chooser = this._runner._environment?.elementChooser;
      if (chooser) socket.emit("elementchooser", chooser.value);
    } else if (type === "logs") {
      // send initial logs
      socket.emit("logs", this._runner.logs);
    } else if (type === "run" && this._runner.progress()) {
      // send current progress if the run is started
      socket.emit("runprogress", this._runner.progress());
    }
  }

  _onUnsubscribe(socket: Socket, { type }: SubscribeMessage): void {
    this._subscriptions.unsubscribe(socket, type);
  }

  _publish(
    emitter: EventEmitter,
    { event, to }: { event: string; to: SubscribeType }
  ): void {
    emitter.on(event, (data) => {
      this._subscriptions.emit(to, { data, event });
    });
  }

  async close(): Promise<void> {
    debug("close");
    await new Promise((resolve) => this._io.close(resolve));
  }
}
