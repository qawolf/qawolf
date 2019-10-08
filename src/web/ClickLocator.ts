import { Locator } from "./Locator";
import {
  findByLabels,
  findByName,
  findByPlaceholder,
  queryVisible
} from "./utils";

export class ClickLocator extends Locator {
  public findEligible(): Element[] {
    if (this.dataAttribute && this.serializedLocator.dataValue) {
      return super.findByDataAttribute();
    } else {
      return queryVisible("*");
    }
  }

  public findIdeal(): Element | null {
    // if no textContent on locator, take best guess
    // otherwise wait until same text content found
    // retu
  }
}
