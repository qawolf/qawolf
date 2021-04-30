/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";

type UpdateKey = {
  key: string;
  value: any;
  version: number;
};

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
    this.emit("changed", { key, value });
    return true;
  }

  set<T>(key: string, value: T): void {
    if (value == this._values.get(key)) return;

    this._values.set(key, value);

    // only set the version if we have one synced from the runner
    // when we connect to the runner we get the latest version
    let version = this._versions.get(key);
    if (version !== undefined) {
      version += 1;
      this._versions.set(key, version);
    }

    this.emit("keychanged", { key, value, version: version || 0 });
    this.emit("changed", { key, value });
  }
}
