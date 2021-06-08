import { EventEmitter } from "events";
import { useEffect, useState } from "react";
import { Awareness } from "y-protocols/awareness";

import { COLORS } from "../../../shared/buildColor";
import { FileModel, UserState } from "../contexts/FileModel";
import { FileState } from "./fileModel";

export type CursorPosition = {
  canvas_x: number;
  canvas_y: number;
  window_x: number;
  window_y: number;
};

export type UserState = CursorPosition & {
  avatar_url: string | null;
  client_id: string;
  color: string;
  created_at: number;
  email: string;
  is_current_client: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selection?: any;
  wolf_variant: string;
};

export type UserStatesHook = {
  userStates: UserState[];
};

export const buildUserStates = (awareness: Awareness): UserState[] => {
  const currentId = awareness.clientID;

  const states = [];

  awareness.getStates().forEach((state, clientId) => {
    if (!state.user) return;

    states.push({
      ...state.cursor,
      ...state.user,
      client_id: clientId,
      is_current_client: clientId === currentId,
      selection: state.selection,
    });
  });

  return states
    .sort((a, b) => a.created_at - b.created_at)
    .map((userState, index) => {
      return {
        ...userState,
        color: COLORS[index % COLORS.length],
      };
    });
};

export class UserAwareness extends EventEmitter {
  _awareness: Awareness;
  _createdAt = Date.now();
  _userStates: UserState[] = [];

  constructor(awareness: Awareness) {
    super();

    this._awareness = awareness;
    this._awareness.on("change", this._updateUserStates);
    this._updateUserStates();
  }

  _updateUserStates = (): void => {
    this._userStates = buildUserStates(this._awareness);
    this.emit("changed", this._userStates);
  };

  dispose(): void {
    this._awareness.setLocalStateField("user", null);
    this._awareness.off("change", this._updateUserStates);
  }

  setCursorPosition(position: CursorPosition): void {
    this._awareness.setLocalStateField("cursor", position);
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
    if (!file.isLoaded || !fileModel) return;

    const userAwareness = new UserAwareness(fileModel.awareness);
    setUserAwareness(userAwareness);

    return () => {
      setUserAwareness(null);
      userAwareness?.dispose();
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
