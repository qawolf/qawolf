import { clickElement, typeElement } from "./browserActions";
import { BrowserAction } from "./workflow";

export class Executor {
  private actions: BrowserAction[];

  constructor(actions: BrowserAction[]) {
    this.actions = actions;
  }

  public run(): void {
    this.actions.forEach(action => {
      if (action.type === "click") {
        clickElement(action.target.xpath);
      } else {
        typeElement(action.target.xpath, action.value || "");
      }
    });

    // update supervisor
    // loop
  }
}
