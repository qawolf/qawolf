import { EventEmitter } from "events";
import { useEffect, useState } from "react";
import { Awareness } from "y-protocols/awareness";

import { buildColor } from "../../../shared/buildColor";
import { FileModel } from "../contexts/FileModel";
import { FileState } from "./fileModel";

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

export type UserStatesHook = {
  userStates: UserState[];
};

export class UserAwareness extends EventEmitter {
  _awareness: Awareness;
  _color?: string;
  _userStates: UserState[] = [];

  constructor(awareness: Awareness) {
    super();

    this._awareness = awareness;
    this._awareness.on("change", this._updateUserStates);
    this._updateUserStates();
  }

  _updateUserStates = (): void => {
    const userStates = [];

    const currentId = this._awareness.clientID;

    this._awareness.getStates().forEach((state, clientId) => {
      if (!state.user) return;

      userStates.push({
        ...state.user,
        client_id: clientId,
        is_current_client: clientId === currentId,
      });
    });

    this._userStates = userStates;

    this.emit("changed", userStates);
  };

  dispose(): void {
    this._awareness.off("change", this._updateUserStates);
  }

  setUserState(
    position: Omit<UserState, "client_id" | "color" | "is_current_client">
  ): void {
    if (!this._color) {
      this._color = buildColor(this._userStates.map((u) => u.color));
    }

    this._awareness.setLocalStateField("user", {
      ...position,
      color: this._color,
    });
  }

  get userStates(): UserState[] {
    return this._userStates;
  }
}

export const useUserAwareness = (
  file: FileState,
  fileModel: FileModel
): UserAwareness => {
  const [userAwareness, setUserAwareness] = useState<UserAwareness>();

  useEffect(() => {
    // this should be set when the file is loaded
    if (!fileModel?.awareness) return;

    const userAwareness = new UserAwareness(fileModel.awareness);
    setUserAwareness(userAwareness);

    return () => {
      setUserAwareness(null);
      userAwareness.dispose();
    };
  }, [file.isLoaded, fileModel]);

  return userAwareness;
};

export const useUserStates = (userAwareness: UserAwareness): UserStatesHook => {
  const [userStates, setUserStates] = useState<UserState[]>([]);

  useEffect(() => {
    if (!userAwareness) return;

    setUserStates(userAwareness.userStates);

    userAwareness.on("changed", setUserStates);

    return () => userAwareness.off("changed", setUserStates);
  }, [userAwareness]);

  return { userStates };
};
