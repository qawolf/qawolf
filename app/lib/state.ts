import { EventEmitter } from "events";

import { isServer } from "./detection";
import { ImageGroup, RunOptions, State as StateType } from "./types";

export const defaultState: StateType = {
  dashboardUri: null,
  editorSidebarWidth: 480,
  email: null,
  environmentId: null,
  error: null,
  groupId: null,
  image: {
    wolf: 0,
  },
  modal: { name: null },
  run: null,
  signUp: {},
  teamId: null,
};

const STATE_KEY = "qaw_state";

class State extends EventEmitter {
  _pendingRun: RunOptions | null = null;
  _state: StateType = defaultState;

  constructor() {
    super();
    this._load();
  }

  _load(): void {
    if (isServer()) return;

    const existingState = localStorage.getItem(STATE_KEY) || "{}";
    this._state = {
      ...defaultState,
      ...this._state,
      ...JSON.parse(existingState),
    };
  }

  _persist(): void {
    if (isServer()) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { error, ...stateToPersist } = this._state;
    localStorage.setItem(STATE_KEY, JSON.stringify(stateToPersist));
  }

  _setState(changes: Partial<StateType>): void {
    this._state = { ...this._state, ...changes };
    this._persist();
    this.emit("changed");
  }

  incrementImageCount(group: ImageGroup): void {
    this._setState({
      ...this._state,
      image: { ...this._state.image, [group]: this._state.image[group] + 1 },
    });
  }

  clear(): void {
    this._state = { ...defaultState };
    this._persist();
  }

  get pendingRun(): RunOptions | null {
    return this._pendingRun;
  }

  setDashboardUri(dashboardUri: StateType["dashboardUri"]): void {
    this._setState({ dashboardUri });
  }

  setEditorSidebarWidth(
    editorSidebarWidth: StateType["editorSidebarWidth"]
  ): void {
    this._setState({ editorSidebarWidth });
  }

  setEmail(email: StateType["email"]): void {
    this._setState({ email });
  }

  setEnvironmentId(environmentId: StateType["environmentId"]): void {
    this._setState({ environmentId });
  }

  setError(error: StateType["error"]): void {
    this._setState({ error });
  }

  setPendingRun(options: RunOptions | null): void {
    this._pendingRun = options;
  }

  setGroupId(groupId: StateType["groupId"]): void {
    this._setState({ groupId });
  }

  setModal(modal: StateType["modal"]): void {
    this._setState({ modal });
  }

  setSignUp(signUp: StateType["signUp"]): void {
    this._setState({ signUp });
  }

  setTeamId(teamId: StateType["teamId"]): void {
    this._setState({ teamId });
  }

  get state(): StateType | null {
    return this._state;
  }
}

export const state = new State();
