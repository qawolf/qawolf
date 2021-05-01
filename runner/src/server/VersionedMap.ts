/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";

type UpdateKey = {
  key: string;
  value: any;
  version: number;
};

// VersionedMap is a temporary solution until we implement better
// shared state management with something like yjs
export class VersionedMap extends EventEmitter {
  readonly _values = new Map<string, any>();
  readonly _versions = new Map<string, any>();

  get(key: string): any {
    return this._values.get(key);
  }

  receive({ key, value, version }: UpdateKey): boolean {
    const currentVersion = this._versions.get(key) || -1;
    if (currentVersion >= version) return false;

    this._values.set(key, value);
    this._versions.set(key, version);
    this.emit("keychanged", { key, value, version });
    return true;
  }

  set<T>(key: string, value: T): void {
    this._values.set(key, value);

    const version = (this._versions.get(key) || -1) + 1;
    this._versions.set(key, version);
    this.emit("keychanged", { key, value, version });
  }
}
