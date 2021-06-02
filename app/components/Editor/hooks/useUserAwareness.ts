import { EventEmitter } from "events";
import { useEffect, useState } from "react";
import { Awareness } from "y-protocols/awareness";

import { buildColor } from "../../../shared/buildColor";

export type UserState = {
  avatar_url: string | null;
  canvas_x: number;
  canvas_y: number;
  color: string;
  client_id: string;
  email: string;
  is_current_client: boolean;
  window_x: number;
  window_y: number;
  wolf_variant: string;
};

export class UserAwareness extends EventEmitter {
  _awareness: Awareness;
  _color?: string;
  _users: UserState[] = [];

  constructor(awareness: Awareness) {
    super();

    this._awareness = awareness;
    this._awareness.on("change", this._updateUsers);
    this._updateUsers();
  }

  _updateUsers = (): void => {
    const users = [];

    const currentId = this._awareness.clientID;

    this._awareness.getStates().forEach((state, clientId) => {
      if (!state.user) return;

      users.push({
        ...state.user,
        client_id: clientId,
        is_current_client: clientId === currentId,
      });
    });

    this._users = users;
    console.log("users", users);

    this.emit("changed", users);
  };

  dispose(): void {
    this._awareness.off("change", this._updateUsers);
  }

  setUserState(
    position: Omit<UserState, "client_id" | "color" | "is_current_client">
  ): void {
    if (!this._color) {
      this._color = buildColor(this._users.map((u) => u.color));
    }

    this._awareness.setLocalStateField("user", {
      ...position,
      color: this._color,
    });
  }
}

type UserAwarenessHook = {
  users: UserState[];
};

export const useUserAwareness = (
  awareness?: UserAwareness
): UserAwarenessHook => {
  const [users, setUsers] = useState<UserState[]>([]);

  useEffect(() => {
    if (!awareness) return;

    awareness.on("changed", setUsers);

    return () => awareness.off("changed", setUsers);
  }, [awareness]);

  return { users };
};
