import { Socket } from "socket.io";

type EmitOptions<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: T;
  event: string;
};

export type SubscribeType = "elementchooser" | "logs" | "run";

export type SubscribeMessage = {
  type: SubscribeType;
};

export class SubscriptionTracker {
  readonly _sockets = new Map<string, Socket>();
  readonly _subscriptions = new Map<SubscribeType, Set<string>>();

  constructor() {
    this._subscriptions.set("elementchooser", new Set());
    this._subscriptions.set("logs", new Set());
    this._subscriptions.set("run", new Set());
  }

  disconnect(socket: Socket): void {
    this._sockets.delete(socket.id);

    for (const type of this._subscriptions.keys()) {
      this.unsubscribe(socket, type);
    }
  }

  emit<T>(to: SubscribeType, { data, event }: EmitOptions<T>): void {
    const ids = this._subscriptions.get(to);
    if (!ids) return;

    ids.forEach((id) => {
      this._sockets.get(id)?.emit(event, data);
    });
  }

  subscribe(socket: Socket, message: SubscribeMessage): void {
    this._sockets.set(socket.id, socket);

    const ids = this._subscriptions.get(message.type);
    if (!ids) return;

    if (!ids.has(socket.id)) ids.add(socket.id);
  }

  unsubscribe(socket: Socket, type: SubscribeType): void {
    const ids = this._subscriptions.get(type);
    if (!ids) return;

    ids.delete(socket.id);
  }
}
