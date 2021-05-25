import { EventEmitter } from "events";
import io from "socket.io-client";

import { state } from "./state";
import { RunOptions } from "./types";
import { VersionedMap } from "./VersionedMap";

type ConnectOptions = {
  apiKey: string | null;
  wsUrl?: string | null;
};

type SubscriptionType =
  | "code"
  | "editor"
  | "elementchooser"
  | "logs"
  | "run"
  | "users";

type User = {
  email: string;
  wolfName: string;
  wolfVariant: string;
};

type SubscriptionMessage = {
  data?: User;
  type: SubscriptionType;
};

const EVENTS = [
  "connect",
  "elementchooser",
  "disconnect",
  "logs",
  "logscreated",
  "runprogress",
  "runstopped",
  "users",
];

export class RunnerClient extends EventEmitter {
  _apiKey: string | null = null;
  _browserReady = false;
  _socket: SocketIOClient.Socket | null = null;
  _subscriptions: SubscriptionMessage[] = [];
  _wsUrl: string | null = null;

  _onConnect = (): void => {
    this._subscriptions.forEach((subscription) => {
      this._socket?.emit("subscribe", subscription);
    });

    this._sendRun();
  };

  _sendRun(): void {
    if (!state.pendingRun || !this._socket?.connected || !this._browserReady) {
      return;
    }

    this._socket.emit("run", state.pendingRun);
    state.setPendingRun(null);
  }

  connect({ apiKey, wsUrl }: ConnectOptions): void {
    if (apiKey === this._apiKey && wsUrl === this._wsUrl) return;

    this._apiKey = apiKey;
    this._wsUrl = wsUrl;

    if (this._socket) {
      this._socket.removeAllListeners();
      this._socket.close();
      this._socket = null;
      this.emit("disconnect");
    }

    if (!wsUrl) return;

    const parsedUrl = new URL(wsUrl);

    this._socket = io(parsedUrl.origin, {
      auth: { apiKey },
      path: `${parsedUrl.pathname}/runner/socket.io`,
      transports: ["websocket"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    this._socket.on("connect", this._onConnect);

    EVENTS.forEach((event) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._socket.on(event, (...args: any[]) => {
        this.emit(event, ...args);
      })
    );
  }

  close(): void {
    this.removeAllListeners();
    this._socket?.close();
  }

  run(options: RunOptions): void {
    state.setPendingRun(options);
    this._sendRun();
  }

  startElementChooser(): void {
    if (!this._socket?.connected) return;

    this._socket.emit("startelementchooser");
  }

  stop(): void {
    state.setPendingRun(null);

    if (this._socket?.connected) {
      this._socket.emit("stop");
    }
  }

  stopElementChooser(): void {
    if (!this._socket?.connected) return;

    this._socket.emit("stopelementchooser");
  }

  setBrowserReady(ready: boolean): void {
    this._browserReady = ready;
    this._sendRun();
  }

  subscribe(message: SubscriptionMessage): void {
    if (this._subscriptions.find((s) => s.type.includes(message.type))) return;

    this._subscriptions.push(message);

    if (this._socket?.connected) {
      this._socket.emit("subscribe", message);
    }
  }

  unsubscribe({ type }: SubscriptionMessage): void {
    if (this._socket?.connected) {
      this._socket.emit("unsubscribe", { type });
    }
  }
}
