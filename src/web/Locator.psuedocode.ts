import { SerializedLocator } from "../types";
import { sleep } from "./utils";

// To Do
// "type" action -> "input" & "select"
// locators should stand on their own, no step...

class Locator {
  findEligible() {
    // if data-qa specified -- filter by that
    // return visible elements
  }

  findIdeal(): Element {
    throw new Error("findIdeal must be implemented by Locator subclass");
  }

  scoreElements() {}

  serialize(): SerializedLocator {
    return {};
  }

  async waitForElement(timeout: number = 30000): Element | null {
    console.log(`Locator: waitForElement ${this.serialize()}`);

    for (let i = 0; i < timeout; i += 500) {
      const idealElement = this.findIdeal();
      if (idealElement) {
        console.log("Locator: found ideal element", idealElement);
        return idealElement;
      }

      await sleep(500);
    }
    console.log("Locator: ideal element not found, ranking eligible elements");

    const topElement = this.findTopElement();
    if (topElement) {
      console.log("Locator: found top ranked element", topElement);
      return topElement;
    }

    console.log("Locator: no element found");
    return null;
  }
}

class InputLocator extends Locator {
  findEligible() {
    // same tag & type (if it exists)
  }

  findIdeal() {
    // matching [label / name / placeholder]
  }
}

class SelectLocator extends Locator {
  findEligible() {
    // eligible -> find select tags
  }

  findIdeal() {
    // matching [label / name / placeholder (disabled option if available)]
  }
}

class ClickLocator extends Locator {
  findIdeal() {
    // matching text
  }
}

const deserializeLocator = (serializedLocator: SerializedLocator): Locator => {
  return new Locator();
};

// TODO in runStep.findElementHandleForStep ->
// const waitForElementHandle = (locator: Locator) => {
//   const locator = deserializeLocator({});
//   const element = await locator.waitForElement();
//   return element;
// };
