import { click, setInputValue } from "./actions";
import { waitForElement } from "./rank";
import { BrowserStep } from "../types";

export const runStep = async (step: BrowserStep) => {
  const element = (await waitForElement(step)) as HTMLElement;
  if (step.type === "click") {
    click(element);
  } else {
    setInputValue(element as HTMLInputElement, step.value);
  }
};
