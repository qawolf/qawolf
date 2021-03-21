import { Callback } from "./types";

export class ElementChooserView {
  _chooser: HTMLElement;
  _highlight: HTMLElement;
  _paw: HTMLElement;
  _root: HTMLElement;
  _shadowRoot: ShadowRoot;

  _onElementChosen: Callback<Element, void>;
  _started = false;

  constructor(onElementChosen: Callback<Element>) {
    this._onElementChosen = onElementChosen;

    this._chooser = createChooser();
    this._highlight = createHighlight();

    this._root = createRoot();

    this._shadowRoot = this._root.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(this._chooser);
    this._shadowRoot.appendChild(this._highlight);

    document.documentElement.appendChild(this._root);
  }

  _onClick(event: MouseEvent): void {
    stopEvent(event);
  }

  _onMouseDown = (event: MouseEvent): void => {
    stopEvent(event);

    const target = event.composedPath()[0] as HTMLElement;
    if (!target || !target.getBoundingClientRect) return;

    // separate painting the chosen ui from the callback
    // to prevent the ui from getting blocked by generating selectors
    requestAnimationFrame(() => {
      // mark it as chosen
      overlay(target, this._chooser);
      this._onElementChosen(target);
    });
  };

  _onMouseMouse = (event: MouseEvent): void => {
    // higlight the current element
    const target = event.composedPath()[0] as HTMLElement;
    if (!target || !target.getBoundingClientRect) return;

    overlay(target, this._highlight);
  };

  _onMouseUp(event: MouseEvent): void {
    stopEvent(event);
  }

  _onScroll = (): void => {
    // hide the chooser and highlight on scroll
    this._chooser.style.height = "0px";
    this._chooser.style.width = "0px";
    this._highlight.style.height = "0px";
    this._highlight.style.width = "0px";
  };

  start() {
    if (this._started) return;
    this._started = true;

    document.addEventListener("click", this._onClick, true);
    document.addEventListener("mousedown", this._onMouseDown, true);
    document.addEventListener("mousemove", this._onMouseMouse, true);
    document.addEventListener("mouseup", this._onMouseMouse, true);
    document.addEventListener("scroll", this._onScroll, true);
  }

  stop() {
    if (!this._started) return;

    document.removeEventListener("click", this._onClick, true);
    document.removeEventListener("mousedown", this._onMouseDown, true);
    document.removeEventListener("mousemove", this._onMouseMouse, true);
    document.removeEventListener("mouseup", this._onMouseMouse, true);
    document.removeEventListener("scroll", this._onScroll, true);

    this._chooser.style.height = "0px";
    this._chooser.style.width = "0px";
    this._highlight.style.height = "0px";
    this._highlight.style.width = "0px";

    this._started = false;
  }
}

function createChooser(): HTMLElement {
  const chooser = document.createElement("div");
  chooser.id = "qawolf-chooser";
  chooser.style.alignItems = "center";
  chooser.style.border = "1px solid rgb(15, 120, 243)";
  chooser.style.borderRadius = "2px";
  chooser.style.display = "flex";
  chooser.style.justifyContent = "center";
  chooser.style.position = "fixed";

  chooser.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.70409 5.3332L4.57076 5.17009C3.88561 4.33195 3.89392 3.11208 4.59042 2.28372L5.41181 1.30682C5.82697 0.813051 6.60625 0.934633 6.85755 1.53238L7.07954 2.06043C7.51438 3.09476 7.40736 4.28301 6.79504 5.21934C6.31057 5.96017 5.26323 6.0172 4.70409 5.3332ZM3.29653 5.62129C2.94969 5.29287 2.38735 5.29287 2.04051 5.62129C0.653162 6.935 0.653162 9.06495 2.04051 10.3787C2.38735 10.7071 2.94969 10.7071 3.29653 10.3787L5.06844 8.7008C5.47719 8.31374 5.47719 7.6862 5.06844 7.29915L3.29653 5.62129ZM12.7035 5.62129C13.0503 5.29287 13.6126 5.29287 13.9595 5.62129C15.3468 6.935 15.3468 9.06495 13.9595 10.3787C13.6126 10.7071 13.0503 10.7071 12.7035 10.3787L10.9316 8.7008C10.5228 8.31374 10.5228 7.6862 10.9316 7.29915L12.7035 5.62129ZM11.4291 5.17009L11.2957 5.3332C10.7366 6.0172 9.68928 5.96017 9.2048 5.21934C8.59248 4.28301 8.48546 3.09476 8.9203 2.06043L9.14229 1.53238C9.39359 0.934633 10.1729 0.813051 10.588 1.30682L11.4094 2.28372C12.1059 3.11208 12.1142 4.33195 11.4291 5.17009ZM7.99997 7.99997C7.41944 7.99997 6.83891 8.32576 6.56203 8.97732C6.32609 9.53255 5.94781 10.0086 5.46909 10.3528L4.00825 11.4032C2.48253 12.5003 3.22485 15 5.07636 15H5.17659C5.64448 15 6.10755 14.9012 6.5381 14.7097C7.00559 14.5017 7.50043 14.3827 7.99997 14.3538C8.49952 14.3827 8.99436 14.5017 9.46184 14.7097C9.8924 14.9012 10.3555 15 10.8234 15H10.9236C12.7751 15 13.5174 12.5003 11.9917 11.4032L10.5309 10.3528C10.0521 10.0086 9.67386 9.53255 9.43792 8.97732C9.16103 8.32576 8.5805 7.99997 7.99997 7.99997Z" fill="rgba(15, 120, 243, 0.25)"/></svg>`;

  return chooser;
}

function createHighlight(): HTMLElement {
  const highlight = document.createElement("div");
  highlight.id = "qawolf-highlight";
  highlight.style.background = "rgba(15, 120, 243, 0.15)";
  highlight.style.position = "fixed";
  return highlight;
}

function createRoot(): HTMLElement {
  const root = document.createElement("div");
  root.style.bottom = "0";
  root.style.left = "0";
  root.style.pointerEvents = "none";
  root.style.position = "fixed";
  root.style.right = "0";
  root.style.top = "0";
  root.style.zIndex = "2147483647"; // max possible
  return root;
}

function overlay(target: HTMLElement, element: HTMLElement): boolean {
  const rect = target.getBoundingClientRect();
  element.style.height = rect.height + "px";
  element.style.left = rect.left + "px";
  element.style.top = rect.top + "px";
  element.style.width = rect.width + "px";
  return true;
}

function stopEvent(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}
