import { click, setInputValue } from "./actions";
import { BrowserAction } from "../types";

export class Executor {
  private actions: BrowserAction[];

  constructor(actions: BrowserAction[]) {
    this.actions = actions;
  }

  public run(): void {
    this.actions.forEach(action => {
      if (action.type === "click") {
        click(action.target.xpath);
      } else {
        setInputValue(action.target.xpath, action.value || "");
      }
    });

    // update supervisor
    // loop
  }
}
