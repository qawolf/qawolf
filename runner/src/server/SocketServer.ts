import Debug from "debug";
import type { EventEmitter } from "events";
import { Server as HttpServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";

import { Runner } from "../runner/Runner";
import { CodeUpdate } from "../types";
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
    this._publish(this._runner, { event: "codeupdated", to: "code" });
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

  _emitUsers(): void {
    const data = this._subscriptions.data("users");
    this._subscriptions.emit("users", { data, event: "users" });
  }

  _onCodeUpdated(data: CodeUpdate): void {
    debug(`received codeupdated ${data.version}`);
    if (!this._runner.updateCode(data)) return;
    this._subscriptions.emit("code", { event: "codeupdated", data });
  }

  _onConnect(socket: Socket): void {
    if (!this._authenticate(socket)) {
      debug(`socket unauthorized ${socket.id}`);
      socket.disconnect();
      return;
    }

    debug(`socket connected ${socket.id}`);
    socket.on("codeupdated", (message) => this._onCodeUpdated(message));
    socket.on("disconnect", () => this._onDisconnect(socket));
    socket.on("run", (message) => this._runner.run(message));
    socket.on("stop", () => this._runner.stop());
    socket.on("subscribe", (message) => this._onSubscribe(socket, message));
    socket.on("unsubscribe", (message) => this._onUnsubscribe(socket, message));
  }

  _onDisconnect(socket: Socket): void {
    debug(`socket disconnected ${socket.id}`);
    this._subscriptions.disconnect(socket);
    this._emitUsers();
  }

  _onSubscribe(socket: Socket, message: SubscribeMessage): void {
    this._subscriptions.subscribe(socket, message);

    const { type } = message;
    if (type === "logs") {
      // send initial logs
      socket.emit("logs", this._runner.logs);
    } else if (type === "run" && this._runner.progress()) {
      // send current progress if the run is started
      socket.emit("runprogress", this._runner.progress());
    } else if (type === "users") {
      // update the current users
      this._emitUsers();
    }
  }

  _onUnsubscribe(socket: Socket, { type }: SubscribeMessage): void {
    this._subscriptions.unsubscribe(socket, type);
    if (type === "users") this._emitUsers();
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
