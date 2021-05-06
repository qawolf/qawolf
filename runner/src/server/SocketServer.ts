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

type ConstructorOptions = {
  httpServer: HttpServer;
  runner: Runner;
};

const debug = Debug("qawolf:SocketServer");

export class SocketServer {
  readonly _io: SocketIoServer;
  readonly _runner: Runner;
  readonly _subscriptions = new SubscriptionTracker();

  constructor({ httpServer, runner }: ConstructorOptions) {
    this._runner = runner;
    this._io = new SocketIoServer(httpServer, { transports: ["websocket"] });
    this._io.on("connect", this._onConnect.bind(this));

    this._publish(this._runner, {
      event: "elementchooser",
      to: "elementchooser",
    });
    this._publish(this._runner, { event: "keychanged", to: "editor" });
    this._publish(this._runner, { event: "logs", to: "logs" });
    this._publish(this._runner, { event: "logscreated", to: "logs" });
    this._publish(this._runner, { event: "runprogress", to: "run" });
  }

  _emitUsers(): void {
    const data = this._subscriptions.data("users");
    this._subscriptions.emit("users", { data, event: "users" });
  }

  _onConnect(socket: Socket): void {
    debug(`socket connected ${socket.id}`);
    socket.on("disconnect", () => this._onDisconnect(socket));
    socket.on("keychanged", (message) => this._runner._editor.receive(message));
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
    this._emitUsers();
  }

  _onSubscribe(socket: Socket, message: SubscribeMessage): void {
    this._subscriptions.subscribe(socket, message);

    const { type } = message;
    if (type === "editor") {
      // emit keychanged for each editor map
      const editor = this._runner._editor;
      editor._values.forEach((value, key) => {
        const version = this._runner._editor._versions.get(key);
        socket.emit("keychanged", { key, value, version });
      });
    } else if (type === "elementchooser") {
      const chooser = this._runner._environment?.elementChooser;
      if (chooser) socket.emit("elementchooser", chooser.value);
    } else if (type === "logs") {
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
