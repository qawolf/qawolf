import KeyTable from "@novnc/novnc/core/input/keysym";
import RFB from "@novnc/novnc/core/rfb";
import { EventEmitter } from "events";
import { useEffect, useRef, useState } from "react";

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
  _container?: HTMLDivElement;
  _ensureInterval: number | null = null;
  _password = "";
  _ready = false;
  _rfb?: typeof RFB;
  _url?: string;
  _reconnectedAt = 0;

  _disconnect(): void {
    const rfb = this._rfb;
    if (!rfb) return;

    this._rfb = null;

    if (this._ensureInterval) {
      clearInterval(this._ensureInterval);
      this._ensureInterval = null;
    }

    this._ready = false;
    this.emit("readychange");

    // Without this `if` I got errors because rfb.disconnect tries to do a state change
    // to "disconnecting", but the state change function throws an error if the state
    // is already currently "disconnected". If _rfb_connection_state is "disconnected",
    // then everything has been cleaned up already in the RFB instance, but we need
    // to do our own cleanup. (We know we haven't done our cleanup yet because
    // this._rfb isn't `null`.)
    if (rfb._rfb_connection_state !== "disconnected") rfb.disconnect();
    rfb.removeEventListener("clipboard", this._onCopy);
    rfb._canvas.removeEventListener("keydown", this._onKeyDown, true);
    rfb.removeEventListener("ready", this._onReady);
  }

  _connect(): void {
    if (!this._container || !this._url) return;

    const rfb = new RFB(this._container, this._url, {
      credentials: { password: this._password },
    });
    const framebufferUpdate = rfb._framebufferUpdate.bind(rfb);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rfb._framebufferUpdate = (...args: any[]) => {
      // only emit ready once
      rfb._framebufferUpdate = framebufferUpdate;
      framebufferUpdate(...args);
      rfb.dispatchEvent({ type: "ready" });
    };
    this._rfb = rfb;
    rfb.scaleViewport = true;
    rfb.addEventListener("clipboard", this._onCopy);
    rfb.addEventListener("ready", this._onReady);
    rfb._canvas.addEventListener("keydown", this._onKeyDown, true);
    this._ensureInterval = window.setInterval(this._ensureConnection, 500);
  }

  _ensureConnection = (): void => {
    const state = this._rfb?._rfbConnectionState;
    if (
      !["connecting", "connected"].includes(state) &&
      // give the last reconnection attempt 10 seconds
      Date.now() - this._reconnectedAt > 10000
    ) {
      console.debug(`Status ${state}, reconnecting...`);
      this._reconnectedAt = Date.now();
      this._disconnect();
      this._connect();
    }
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

  _onReady = (): void => {
    this._ready = true;
    this.emit("readychange");
  };

  close(): void {
    this._disconnect();
  }

  connect(container: HTMLDivElement, url: string, password: string): void {
    if (this._container === container && this._url === url) return;
    this._disconnect();
    this._container = container;
    this._password = password;
    this._url = url;
    this._connect();
  }

  get ready(): boolean {
    return this._ready;
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
  const browserRef = useRef(new Browser());

  const [isBrowserReady, setIsBrowserReady] = useState(
    browserRef.current.ready
  );

  useEffect(() => {
    const browser = browserRef.current;

    const onReadyChange = async () => setIsBrowserReady(browser.ready);

    browser.on("readychange", onReadyChange);

    return () => {
      browser.off("readychange", onReadyChange);
      browser.close();
    };
  }, [browserRef]);

  return {
    browser: browserRef.current,
    isBrowserReady,
  };
};
