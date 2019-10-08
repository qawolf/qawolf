import { Action, SerializedLocator } from "../types";
import { queryVisible } from "./utils";

type ConstructorArgs = {
  action: Action;
  dataAttribute?: string;
  serializedLocator: SerializedLocator;
};

export class Locator {
  protected dataAttribute?: string;
  protected serializedLocator: SerializedLocator;

  constructor({ dataAttribute, serializedLocator }: ConstructorArgs) {
    this.dataAttribute = dataAttribute;
    this.serializedLocator = serializedLocator;
  }

  public findEligible(): Element[] {
    throw new Error("findEligible must be implemented by Locator subclass");
  }

  public findIdeal(): Element | null {
    throw new Error("findIdeal must be implemented by Locator subclass");
  }

  public serialize(): SerializedLocator {
    return this.serializedLocator;
  }

  protected findByDataAttribute(): Element[] {
    const selector = `[${this.dataAttribute}='${this.serializedLocator.dataValue}']`;
    const elements = queryVisible(selector);

    if (elements.length > 1) {
      throw new Error(
        `Can't decide: found ${elements.length} elements with data attribute ${selector}`
      );
    }

    return elements.length ? [elements[0]] : [];
  }
}
