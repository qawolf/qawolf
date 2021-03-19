import { ActionRecorder } from "./ActionRecorder";
import {
  getAssertText,
  getDescriptor,
  isFillable as isElementFillable,
} from "./element";
import { generateSelectors } from "./generateSelectors";
import { Callback, ElementChosen, RankedSelector } from "./types";

type ElementChosenCallback = Callback<ElementChosen>;

const PAW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.70409 5.3332L4.57076 5.17009C3.88561 4.33195 3.89392 3.11208 4.59042 2.28372L5.41181 1.30682C5.82697 0.813051 6.60625 0.934633 6.85755 1.53238L7.07954 2.06043C7.51438 3.09476 7.40736 4.28301 6.79504 5.21934C6.31057 5.96017 5.26323 6.0172 4.70409 5.3332ZM3.29653 5.62129C2.94969 5.29287 2.38735 5.29287 2.04051 5.62129C0.653162 6.935 0.653162 9.06495 2.04051 10.3787C2.38735 10.7071 2.94969 10.7071 3.29653 10.3787L5.06844 8.7008C5.47719 8.31374 5.47719 7.6862 5.06844 7.29915L3.29653 5.62129ZM12.7035 5.62129C13.0503 5.29287 13.6126 5.29287 13.9595 5.62129C15.3468 6.935 15.3468 9.06495 13.9595 10.3787C13.6126 10.7071 13.0503 10.7071 12.7035 10.3787L10.9316 8.7008C10.5228 8.31374 10.5228 7.6862 10.9316 7.29915L12.7035 5.62129ZM11.4291 5.17009L11.2957 5.3332C10.7366 6.0172 9.68928 5.96017 9.2048 5.21934C8.59248 4.28301 8.48546 3.09476 8.9203 2.06043L9.14229 1.53238C9.39359 0.934633 10.1729 0.813051 10.588 1.30682L11.4094 2.28372C12.1059 3.11208 12.1142 4.33195 11.4291 5.17009ZM7.99997 7.99997C7.41944 7.99997 6.83891 8.32576 6.56203 8.97732C6.32609 9.53255 5.94781 10.0086 5.46909 10.3528L4.00825 11.4032C2.48253 12.5003 3.22485 15 5.07636 15H5.17659C5.64448 15 6.10755 14.9012 6.5381 14.7097C7.00559 14.5017 7.50043 14.3827 7.99997 14.3538C8.49952 14.3827 8.99436 14.5017 9.46184 14.7097C9.8924 14.9012 10.3555 15 10.8234 15H10.9236C12.7751 15 13.5174 12.5003 11.9917 11.4032L10.5309 10.3528C10.0521 10.0086 9.67386 9.53255 9.43792 8.97732C9.16103 8.32576 8.5805 7.99997 7.99997 7.99997Z" fill="rgba(15, 120, 243, 0.25)"/></svg>`;

export class ElementChooser {
  _actionRecorder?: ActionRecorder;
  _onDispose: Callback[] = [];
  _chooserElement: HTMLElement;
  _pawElement: HTMLElement;
  _shadowParent: HTMLElement;
  _shadowRoot: ShadowRoot;
  _started = false;

  constructor(actionRecorder?: ActionRecorder) {
    this._actionRecorder = actionRecorder;
  }

  _attachChooserElement(): void {
    if (!this._chooserElement) {
      this._chooserElement = document.createElement("div");
      this._chooserElement.id = "qawolf-chooser";
      this._chooserElement.innerHTML = PAW_SVG;
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

  _onChooseElement(target: HTMLElement): void {
    const callback: ElementChosenCallback = (window as any).qawElementChosen;
    if (!callback) return;

    const isFillable = isElementFillable(getDescriptor(target));

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
      this._chooserElement.style.border = "1px solid rgba(15, 120, 243, 1)";
      this._pawElement.style.visibility = "visible";

      // allow ui update to happen first
      requestAnimationFrame(() => {
        this._onChooseElement(event.target as HTMLElement);
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
    if (this._actionRecorder) this._actionRecorder.stop();

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
    if (this._actionRecorder) this._actionRecorder.start();
  }
}

function stopEvent(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}
