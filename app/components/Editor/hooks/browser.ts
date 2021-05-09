import KeyTable from "@novnc/novnc/core/input/keysym";
import RFB from "@novnc/novnc/core/rfb";
import { EventEmitter } from "events";
import { useEffect, useState } from "react";

import { isMac } from "../../../lib/detection";

const COMMAND_KEYS_TO_INTERCEPT = [
  "A",
  "C",
  "X",
  "V",
  "Z",
  "a",
  "c",
  "x",
  "v",
  "z",
];

export class Browser extends EventEmitter {
  _connected: boolean;
  _container?: HTMLDivElement;
  _ensureInterval: number | null = null;
  _rfb?: typeof RFB;
  _url?: string;
  _reconnectedAt = 0;

  _connect(): void {
    if (!this._container || !this._url || this._connected) return;

    const rfb = new RFB(this._container, this._url);

    this._rfb = rfb;
    rfb.scaleViewport = true;

    rfb.addEventListener("connect", this._onConnect);
    rfb.addEventListener("clipboard", this._onCopy);
    rfb.addEventListener("disconnect", this._onDisconnect);
    rfb._canvas.addEventListener("keydown", this._onKeyDown, true);
  }

  _onConnect = (): void => {
    this._connected = true;
    this.emit("connectedchanged");
  };

  _onDisconnect = (): void => {
    this._connected = false;
    this.emit("connectedchanged");

    // try to reconnect on a delay
    setTimeout(() => this._connect(), 5000);
  };

  // This is called whenever we get the "clipboard" event from the RFB.
  // The `text` is from the runner copy or cut event. We call `writeText`
  // to put that text on the local computer's clipboard. Note that this
  // is an async API so there can be a slight delay here.
  //
  // The "clipboard" event seems to be emitted in additional cases where
  // a copy or paste has not actually occurred, which maybe is a noVNC
  // bug. In particular, whenever you highlight some text, we receive
  // that text here. This could sometimes be annoying when you think
  // you know what you last copied but it has actually been replaced.
  // But since there doesn't seem to be any other way to do this and there
  // is nothing that identifies what triggered the event, we live with it.
  _onCopy = async (event: CopyEvent): Promise<void> => {
    const { text } = event.detail;

    if (typeof navigator.clipboard?.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        console.debug(
          `Successfully updated local clipboard from remote copy. Copied text: "${text}"`
        );
      } catch (error) {
        console.error("Error updating local clipboard from remote copy", error);
      }
    } else {
      console.debug(
        "Error updating local clipboard from remote copy. Ensure your connection uses HTTPS. " +
          "If it does, then this browser may not yet support writing to the clipboard."
      );
    }
  };

  _onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    if (!this._rfb) return;

    // Handle Mac -> Windows command keys, including pasting
    if (COMMAND_KEYS_TO_INTERCEPT.includes(event.key) && !event.repeat) {
      // Detect CMD+<key> press on Mac
      if (isMac && event.metaKey) {
        // Prevent the browser from highlighting all the text on the page
        event.preventDefault();
        // Prevent the noVNC handlers from running
        event.stopImmediatePropagation();
      }

      // For a paste, first transfer the current clipboard entry to the remote clipboard.
      if (
        ["V", "v"].includes(event.key) &&
        ((isMac && event.metaKey) || (!isMac && event.ctrlKey))
      ) {
        if (typeof navigator.clipboard?.readText === "function") {
          try {
            const text = await navigator.clipboard.readText();
            this._rfb.clipboardPasteFrom(text);
            console.debug(
              `Successfully updated remote clipboard from local copy. Copied text: "${text}"`
            );
          } catch (error) {
            console.error("Error sending pasted text to remote runner", error);
          }
        } else {
          // https://bugzilla.mozilla.org/show_bug.cgi?id=1461465#c58
          console.debug(
            "Error sending pasted text to remote runner. Ensure your connection uses HTTPS. " +
              "If it does, then this browser may not yet support reading from the clipboard."
          );
        }
      }

      // Send the Windows shortcut instead.
      if (isMac && event.metaKey) {
        sendWindowsControlSequence(this._rfb, event.key.charCodeAt(0));
      }
    }
  };

  connect(container: HTMLDivElement, url: string): void {
    if (this._container === container && this._url === url) return;

    this.disconnect();

    this._container = container;
    this._url = url;
    this._connect();
  }

  disconnect(): void {
    this._container = null;
    this._url = null;

    this._connected = false;
    this.emit("connectedchanged");

    const rfb = this._rfb;
    if (!rfb) return;

    this._rfb = null;
    rfb.removeEventListener("clipboard", this._onCopy);
    rfb.removeEventListener("connect", this._onDisconnect);
    rfb.removeEventListener("disconnect", this._onDisconnect);
    rfb._canvas.removeEventListener("keydown", this._onKeyDown, true);

    if (["connected", "connecting"].includes(rfb._rfbConnectionState)) {
      rfb.disconnect();
    }
  }

  get connected(): boolean {
    return this._connected;
  }

  refresh(): void {
    const rfb = this._rfb;
    if (!rfb) return;

    rfb.scaleViewport = false;
    rfb.scaleViewport = true;
  }
}

function sendWindowsControlSequence(rfb: typeof RFB, keyCode: number): void {
  // On the Mac, need to release the Meta.
  rfb.sendKey(KeyTable.XK_Super_L, "MetaLeft", false);
  rfb.sendKey(KeyTable.XK_Super_L, "MetaRight", false);

  rfb.sendKey(KeyTable.XK_Control_L, "ControlLeft", true); // Control DOWN
  rfb.sendKey(keyCode); // key press (will do down followed by up)
  rfb.sendKey(KeyTable.XK_Control_L, "ControlLeft", false); // Control UP
}

type CopyEventDetail = {
  text: string;
};

type CopyEvent = {
  detail: CopyEventDetail;
};

export type BrowserHook = {
  browser: Browser | null;
  isBrowserReady: boolean;
};

export const useBrowser = (): BrowserHook => {
  const [isBrowserReady, setIsBrowserReady] = useState(false);
  const [browser, setBrowser] = useState<Browser>();

  useEffect(() => {
    setBrowser(new Browser());
  }, []);

  useEffect(() => {
    if (!browser) return;

    const onConnectedChanged = async () => setIsBrowserReady(browser.connected);

    browser.on("connectedchanged", onConnectedChanged);

    return () => {
      browser.off("connectedchanged", onConnectedChanged);
      browser.disconnect();
    };
  }, [browser]);

  return {
    browser,
    isBrowserReady,
  };
};
