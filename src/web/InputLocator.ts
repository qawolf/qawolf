import { Locator } from "./Locator";
import {
  findByLabels,
  findByName,
  findByPlaceholder,
  queryVisible
} from "./utils";

export class InputLocator extends Locator {
  public findEligible(): Element[] {
    if (this.dataAttribute && this.serializedLocator.dataValue) {
      return super.findByDataAttribute();
    } else {
      if (!this.serializedLocator.tagName) {
        throw new Error(
          `No tag name provided on locator ${this.serializedLocator}`
        );
      }
      const selector = this.serializedLocator.inputType
        ? `${this.serializedLocator.tagName}[type='${this.serializedLocator.inputType}']`
        : this.serializedLocator.tagName;

      return queryVisible(selector);
    }
  }

  public findIdeal(): Element | null {
    const candidates = this.findEligible();
    if (!candidates.length) return null;
    if (this.dataAttribute && this.serializedLocator.dataValue) {
      return candidates[0];
    }

    if (this.serializedLocator.labels) {
      return findByLabels(candidates, this.serializedLocator.labels);
    }
    if (this.serializedLocator.name) {
      return findByName(candidates, this.serializedLocator.name);
    }
    if (this.serializedLocator.placeholder) {
      return findByPlaceholder(candidates, this.serializedLocator.placeholder);
    }

    return null;
  }
}
