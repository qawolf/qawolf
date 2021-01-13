import { Socket } from "socket.io";

type EmitOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  event: string;
};

type User = {
  email: string;
  wolfName: string;
  wolfVariant: string;
};

type SubscribeData = User | undefined;

export type SubscribeType = "code" | "logs" | "run" | "users";

export type SubscribeMessage = {
  type: SubscribeType;
  data?: SubscribeData;
};

type SubscriptionCollection = {
  data: SubscribeData[];
  ids: string[];
};

export class SubscriptionTracker {
  readonly _sockets = new Map<string, Socket>();
  readonly _subscriptions = new Map<SubscribeType, SubscriptionCollection>();

  constructor() {
    this._subscriptions.set("code", { data: [], ids: [] });
    this._subscriptions.set("logs", { data: [], ids: [] });
    this._subscriptions.set("run", { data: [], ids: [] });
    this._subscriptions.set("users", { data: [], ids: [] });
  }

  data(type: SubscribeType): SubscribeData[] {
    const collection = this._subscriptions.get(type);
    return collection?.data || [];
  }

  disconnect(socket: Socket): void {
    this._sockets.delete(socket.id);

    for (const type of this._subscriptions.keys()) {
      this.unsubscribe(socket, type);
    }
  }

  emit(to: SubscribeType, { data, event }: EmitOptions): void {
    const collection = this._subscriptions.get(to);
    if (!collection) return;

    collection.ids.forEach((id) => {
      this._sockets.get(id)?.emit(event, data);
    });
  }

  subscribe(socket: Socket, message: SubscribeMessage): void {
    this._sockets.set(socket.id, socket);

    const collection = this._subscriptions.get(message.type);
    if (!collection) return;

    const index = collection.ids.indexOf(socket.id);
    if (index >= 0) {
      collection.data[index] = message.data;
    } else {
      collection.data.push(message.data);
      collection.ids.push(socket.id);
    }
  }

  unsubscribe(socket: Socket, type: SubscribeType): void {
    const collection = this._subscriptions.get(type);
    if (!collection) return;

    const index = collection.ids.indexOf(socket.id);
    if (index >= 0) {
      collection.data.splice(index, 1);
      collection.ids.splice(index, 1);
    }
  }
}
