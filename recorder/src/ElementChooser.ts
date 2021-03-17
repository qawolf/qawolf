import { getAssertText } from "./element";
import { generateSelectors } from "./generateSelectors";
import { Callback, ElementChosen, RankedSelector } from "./types";

type ElementChosenCallback = Callback<ElementChosen>;

export class ElementChooser {
  _chooserElement: HTMLElement;
  _shadowParent: HTMLElement;
  _shadowRoot: ShadowRoot;
  _started = false;

  _attachChooserElement(): void {
    if (!this._chooserElement) {
      this._chooserElement = document.createElement("div");
      this._chooserElement.id = "qawolf-chooser";
      this._chooserElement.style.position = "fixed";
      this._shadowRoot.appendChild(this._chooserElement);
    }

    this._resetChooser();
  }

  _attachShadow(): void {
    if (this._shadowParent) return;

    this._shadowParent = document.createElement("div");

    const style = this._shadowParent.style;
    style.bottom = "0";
    style.left = "0";
    style.pointerEvents = "none";
    style.position = "fixed";
    style.top = "0";
    style.right = "0";
    // max possible
    style.zIndex = "2147483647";
    document.documentElement.appendChild(this._shadowParent);
    this._shadowRoot = this._shadowParent.attachShadow({ mode: "open" });
  }

  _onChooseElement(target: HTMLElement): void {
    const callback: ElementChosenCallback = (window as any).qawElementChosen;
    if (!callback) return;

    const text = getAssertText(target);

    const selectors: RankedSelector[] = [];
    const selectorsIterator = generateSelectors(target, 10000);

    for (const selector of selectorsIterator) {
      selectors.push(selector);
      selectors.sort((a, b) => {
        const penaltyDistance = a.penalty - b.penalty;
        if (penaltyDistance !== 0) return penaltyDistance;
        return a.selector.localeCompare(b.selector);
      });

      callback({ selectors, text });

      if (selectors.length > 20) break;
    }
  }

  _onMouseDown = (event: MouseEvent): void => {
    stopEvent(event);

    // mark as chosen
    this._chooserElement.style.background = "rgba(233, 110, 164, 0.5)";

    document.removeEventListener("mousemove", this._onMouseMouse, true);

    this._onChooseElement(event.target as HTMLElement);
  };

  _onMouseMouse = (event: MouseEvent): void => {
    const element = event.composedPath()[0] as HTMLElement;
    if (!element || !element.getBoundingClientRect) return;

    // move to the current element
    const box = element.getBoundingClientRect();
    const style = this._chooserElement.style;
    style.height = box.height + "px";
    style.left = box.left + "px";
    style.top = box.top + "px";
    style.width = box.width + "px";
  };

  _onScroll = (): void => {
    this._resetChooser(false);
  };

  _resetChooser = (visible = true): void => {
    const { style } = this._chooserElement;

    style.height = "0px";
    style.width = "0px";
    style.display = visible ? "block" : "none";
    style.background = "rgba(233, 110, 164, 0.2)";
  };

  start(): void {
    this._attachShadow();
    this._attachChooserElement();

    if (this._started) return;
    this._started = true;

    document.addEventListener("click", stopEvent, true);
    document.addEventListener("mouseup", stopEvent, true);

    document.addEventListener("mousedown", this._onMouseDown, true);
    document.addEventListener("mousemove", this._onMouseMouse, true);
    document.addEventListener("scroll", this._onScroll, true);
  }

  stop(): void {
    this._chooserElement.style.display = "none";

    document.removeEventListener("click", stopEvent, true);
    document.removeEventListener("mouseup", stopEvent, true);

    document.removeEventListener("mousedown", this._onMouseDown, true);
    document.removeEventListener("mousemove", this._onMouseMouse, true);
    document.removeEventListener("scroll", this._onScroll, true);

    this._started = false;
  }
}

function stopEvent(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}
