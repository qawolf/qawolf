import {
  getAssertText,
  getDescriptor,
  isFillable as isElementFillable,
} from "./element";
import { generateSelectors } from "./generateSelectors";
import { PawSvg } from "./PawSvg";
import { Callback, ElementChosen, RankedSelector } from "./types";

type ElementChosenCallback = Callback<ElementChosen>;

export class ElementChooser {
  _onDispose: Callback[] = [];
  _chooserElement: HTMLElement;
  _pawElement: HTMLElement;
  _shadowParent: HTMLElement;
  _shadowRoot: ShadowRoot;
  _started = false;

  _attachChooserElement(): void {
    if (!this._chooserElement) {
      this._chooserElement = document.createElement("div");
      this._chooserElement.id = "qawolf-chooser";
      this._chooserElement.innerHTML = PawSvg;
      this._pawElement = this._chooserElement.children[0] as HTMLElement;
      this._pawElement.style.visibility = "hidden";

      this._shadowRoot.appendChild(this._chooserElement);

      const { style } = this._chooserElement;
      style.alignItems = "center";
      style.display = "flex";
      style.borderRadius = "2px";
      style.justifyContent = "center";
      style.position = "fixed";
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

  _onChooseElement(
    target: HTMLElement,
    isFillable: boolean,
    text: string,
    callback: ElementChosenCallback
  ): void {
    const selectors: RankedSelector[] = [];
    const selectorsIterator = generateSelectors(target, 10000);

    for (const selector of selectorsIterator) {
      selectors.push(selector);

      selectors.sort((a, b) => {
        const penaltyDistance = a.penalty - b.penalty;
        if (penaltyDistance !== 0) return penaltyDistance;
        return a.selector.localeCompare(b.selector);
      });

      callback({
        isFillable,
        selectors: selectors.map((s) => s.selector),
        text,
      });

      if (selectors.length > 20) break;
    }

    if (isFillable) {
      const updateText = () => {
        callback({
          isFillable,
          selectors: selectors.map((s) => s.selector),
          text: getAssertText(target),
        });
      };

      // track the text changes
      target.addEventListener("change", updateText, true);
      target.addEventListener("input", updateText, true);

      this._onDispose.push(() => {
        target.removeEventListener("change", updateText, true);
        target.removeEventListener("input", updateText, true);
      });
    }
  }

  _onMouseDown = (event: MouseEvent): void => {
    stopEvent(event);

    // do not allow choosing another element
    document.removeEventListener("mousedown", this._onMouseDown, true);
    document.removeEventListener("mousemove", this._onMouseMouse, true);

    // prevent clicking on something else
    document.addEventListener("mousedown", stopEvent, true);

    requestAnimationFrame(() => {
      // mark as chosen
      this._chooserElement.style.border = "1px solid rgb(15, 120, 243)";
      this._pawElement.style.visibility = "visible";

      const callback: ElementChosenCallback = (window as any).qawElementChosen;
      if (!callback) return;

      // notify element chosen immediately so choose placeholder goes away
      const target = event.target as HTMLElement;
      const isFillable = isElementFillable(getDescriptor(target));
      const text = getAssertText(target);
      callback({ isFillable, selectors: [], text });

      // allow ui update to happen before generating selectors
      requestAnimationFrame(() => {
        this._onChooseElement(target, isFillable, text, callback);
      });
    });
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
    this._pawElement.style.visibility = "hidden";

    const { style } = this._chooserElement;
    style.visibility = visible ? "visible" : "hidden";
    style.background = "rgba(15, 120, 243, 0.15)";
    style.border = "";
    style.height = "0px";
    style.width = "0px";
  };

  start(): void {
    this._attachShadow();
    this._attachChooserElement();

    if (this._started) return;
    this._started = true;

    // prevent mouseup / click so you can select an item in a dropdown
    document.addEventListener("click", stopEvent, true);
    document.addEventListener("mouseup", stopEvent, true);

    document.addEventListener("mousedown", this._onMouseDown, true);
    document.addEventListener("mousemove", this._onMouseMouse, true);
    document.addEventListener("scroll", this._onScroll, true);
  }

  stop(): void {
    if (!this._started) return;

    this._resetChooser(false);

    document.removeEventListener("click", stopEvent, true);
    document.removeEventListener("mousedown", stopEvent, true);
    document.removeEventListener("mouseup", stopEvent, true);

    document.removeEventListener("mousedown", this._onMouseDown, true);
    document.removeEventListener("mousemove", this._onMouseMouse, true);
    document.removeEventListener("scroll", this._onScroll, true);

    this._onDispose.forEach((cb) => cb());
    this._onDispose = [];

    this._started = false;
  }
}

function stopEvent(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}
