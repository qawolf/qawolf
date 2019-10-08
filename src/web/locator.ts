import { Action, SerializedLocator } from "../types";
import { sleep } from "./sleep";

type ConstructorArgs = {
  action: Action;
  dataAttribute?: string;
  serializedLocator: SerializedLocator;
};

// XXX: filter out invisible elements
class Locator {
  private dataAttribute?: string;
  private serializedLocator: SerializedLocator;

  constructor({ dataAttribute, serializedLocator }: ConstructorArgs) {
    this.dataAttribute = dataAttribute;
    this.serializedLocator = serializedLocator;
  }

  public findEligible() {
    if (this.dataAttribute && this.serializedLocator.dataValue) {
      const selector = `[${this.dataAttribute}='${this.serializedLocator.dataValue}']`;
      const elements = document.querySelectorAll(selector);

      if (elements.length > 1) {
        throw new Error(
          `Can't decide: found ${elements.length} elements with data attribute ${selector}`
        );
      }

      return elements[0] || null;
    }
  }

  public findIdeal(): Element | null {
    throw new Error("findIdeal must be implemented by Locator subclass");
  }

  public serialize(): SerializedLocator {
    return this.serializedLocator;
  }
}
