import { EventEmitter } from "events";

import { isServer } from "./detection";
import { RunOptions, State as StateType } from "./types";

export const defaultState: StateType = {
  branch: null,
  dashboardUri: null,
  editorSidebarWidth: 480,
  email: null,
  environmentId: null,
  isSubscribed: true,
  modal: { name: null },
  run: null,
  signUp: {},
  teamId: null,
  toast: null,
};

const STATE_KEY = "qaw_state";

class State extends EventEmitter {
  _pendingRun: RunOptions | null = null;
  _state: StateType = defaultState;
  _toastTimeout: NodeJS.Timeout | null = null;

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
    const { toast, ...stateToPersist } = this._state;
    localStorage.setItem(STATE_KEY, JSON.stringify(stateToPersist));
  }

  _setState(changes: Partial<StateType>): void {
    this._state = { ...this._state, ...changes };
    this._persist();
    this.emit("changed");
  }

  clear(): void {
    this._state = { ...defaultState };
    this._persist();
  }

  get pendingRun(): RunOptions | null {
    return this._pendingRun;
  }

  setBranch(branch: StateType["branch"]): void {
    this._setState({ branch });
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

  setIsSubscribed(isSubscribed: StateType["isSubscribed"]): void {
    this._setState({ isSubscribed });
  }

  setPendingRun(options: RunOptions | null): void {
    this._pendingRun = options;
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

  setToast(toast: StateType["toast"]): void {
    if (this._toastTimeout) {
      clearTimeout(this._toastTimeout);
      this._toastTimeout = null;
    }

    this._setState({ toast });

    if (toast?.expiresIn) {
      this._toastTimeout = setTimeout(() => {
        this._setState({ toast: null });
        this._toastTimeout = null;
      }, toast.expiresIn);
    }
  }

  get state(): StateType | null {
    return this._state;
  }
}

export const state = new State();
