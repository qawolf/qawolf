import { BrowserAction } from "./workflow";

export class Executor {
  private actions: BrowserAction[];

  constructor(actions: BrowserAction[]) {
    this.actions = actions;
  }

  run() {
    // do action
    // update supervisor
    // loop
  }
}
