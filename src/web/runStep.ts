import { click, scrollTo, setInputValue } from "./actions";
import { waitForElement } from "./rank";
import { BrowserStep } from "../types";

export const runStep = async (step: BrowserStep) => {
  if (step.action === "scroll") {
    await scrollTo(step.scrollTo!);
    return;
  }

  const element = (await waitForElement(step)) as HTMLElement;
  if (step.action === "click") {
    click(element);
  } else {
    setInputValue(element as HTMLInputElement, step.value);
  }
};
