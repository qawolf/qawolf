import {
  getAssertText,
  getDescriptor,
  isFillable as isElementFillable,
} from "./element";
import { ElementChooserView } from "./ElementChooserView";
import { generateSelectors } from "./generateSelectors";
import { Callback, ElementChosen, RankedSelector } from "./types";

export class ElementChooserController {
  _disposeTextObserver: Callback | null = null;
  _view: ElementChooserView;

  _notifyElementChosen(value: ElementChosen) {
    const callback = (window as any).qawElementChosen;
    if (callback) callback(value);
  }

  _generateSelectors(
    target: HTMLElement,
    isFillable: boolean,
    text: string
  ): string[] {
    const selectors: RankedSelector[] = [];
    const selectorsIterator = generateSelectors(target, 10000);

    for (const selector of selectorsIterator) {
      selectors.push(selector);

      selectors.sort((a, b) => {
        const penaltyDistance = a.penalty - b.penalty;
        if (penaltyDistance !== 0) return penaltyDistance;
        return a.selector.localeCompare(b.selector);
      });

      this._notifyElementChosen({
        isFillable,
        selectors: selectors.map((s) => s.selector),
        text,
      });

      if (selectors.length > 20) break;
    }

    return selectors.map((s) => s.selector);
  }

  _observeTextChanges = (
    target: HTMLElement,
    isFillable: boolean,
    selectors: string[]
  ): void => {
    const notifyTextChanged = () => {
      this._notifyElementChosen({
        isFillable,
        selectors,
        text: getAssertText(target),
      });
    };

    // observe the text changes
    target.addEventListener("change", notifyTextChanged, true);
    target.addEventListener("input", notifyTextChanged, true);

    this._disposeTextObserver = () => {
      target.removeEventListener("change", notifyTextChanged, true);
      target.removeEventListener("input", notifyTextChanged, true);
    };
  };

  _onElementChosen = (target: HTMLElement): void => {
    if (this._disposeTextObserver) {
      this._disposeTextObserver();
      this._disposeTextObserver = null;
    }

    const isFillable = isElementFillable(getDescriptor(target));
    const text = getAssertText(target);

    // notify element chosen immediately so choose placeholder goes away
    this._notifyElementChosen({ isFillable, selectors: [], text });

    // separate raf to prevent blocking the ui update
    requestAnimationFrame(() => {
      const selectors = this._generateSelectors(target, isFillable, text);
      this._observeTextChanges(target, isFillable, selectors);
    });
  };

  start(): void {
    if (!this._view) {
      this._view = new ElementChooserView(this._onElementChosen);
    }

    this._view.start();
  }

  stop(): void {
    if (!this._view) return;

    this._view.stop();
  }
}
