import Debug from "debug";
import { EventEmitter } from "events";
import {
  BrowserContext,
  CDPSession,
  ChromiumBrowserContext,
  Frame,
  Page,
} from "playwright";
import { Protocol } from "playwright/types/protocol";

import config from "../config";
import { forEachPage } from "../environment/forEach";
import { ElementEvent, WindowAction, WindowEvent } from "../types";

const debug = Debug("qawolf:ContextEventCollector");

const BLANK_URLS = ["chrome://newtab/", "about:blank"];

type BindingOptions = {
  frame: Frame;
  page: Page;
};

type LastPageNavigation = {
  entriesById: Map<number, Protocol.Page.NavigationEntry>;
  lastHighestEntryId: number;
  lastHistoryEntriesLength: number;
  lastHistoryIndex: number;
};

export class ContextEventCollector extends EventEmitter {
  readonly _activeSessions = new Set<CDPSession>();
  readonly _context: BrowserContext;
  readonly _pageNavigationHistory = new Map<Page, LastPageNavigation>();

  public static async create(
    context: BrowserContext
  ): Promise<ContextEventCollector> {
    const collector = new ContextEventCollector(context);
    await collector._create();
    return collector;
  }

  protected constructor(context: BrowserContext) {
    super();
    this._context = context;
  }

  async _buildFrameSelector(frame: Frame): Promise<string | null> {
    // only build the frame selector if it is one frame down from the parent
    // skip building the frame for the main frame and nested frames
    const parentFrame = frame.parentFrame();
    if (!parentFrame || parentFrame.parentFrame()) return null;

    const name = frame.name();

    const fallbackSelector = name
      ? `[name="${name}"]`
      : `[url="${frame.url()}"`;

    try {
      const frameElement = await frame.frameElement();
      const selector = await parentFrame.evaluate(
        ({ frameElement }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const qawolf: any = (window as any).qawolf;
          return qawolf.getSelector(frameElement);
        },
        { frameElement }
      );
      return selector || fallbackSelector;
    } catch (error) {}

    // Due to timing, there's a possibility that `frameElement()`
    // throws due to the frame's parent having been closed/disposed.
    return fallbackSelector;
  }

  async _create(): Promise<void> {
    await this._context.exposeBinding(
      "qawElementAction",
      async ({ frame, page }: BindingOptions, elementEvent: ElementEvent) => {
        const event: ElementEvent = { ...elementEvent, page };

        const frameSelector = await this._buildFrameSelector(frame);
        if (frameSelector) {
          event.frame = frame;
          event.frameSelector = frameSelector;
        }

        debug(`emit %j`, event);
        this.emit("elementevent", event);
      }
    );

    await forEachPage(this._context, async (page) => {
      // Currently only ChromiumBrowserContext can do CDP, so we cannot support adding
      // new tabs manually or back/forward/reload on other browsers.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((this._context as any).newCDPSession) {
        const session = await (this
          ._context as ChromiumBrowserContext).newCDPSession(page);
        const { currentIndex, entries } = await session.send(
          "Page.getNavigationHistory"
        );
        const highestEntryId = entries.reduce(
          (highest, entry) => (entry.id > highest ? entry.id : highest),
          0
        );

        const currentHistoryEntry = entries[currentIndex];
        if (
          currentHistoryEntry.transitionType === "typed" &&
          !BLANK_URLS.includes(currentHistoryEntry.url)
        ) {
          const event: WindowEvent = {
            action: "goto",
            page,
            value: currentHistoryEntry.url,
          };

          this.emit("windowevent", event);
        }

        const entriesById = new Map<number, Protocol.Page.NavigationEntry>();
        // We update entriesById only for the current entry
        entriesById.set(currentHistoryEntry.id, currentHistoryEntry);

        this._pageNavigationHistory.set(page, {
          entriesById,
          lastHighestEntryId: highestEntryId,
          lastHistoryEntriesLength: entries.length,
          lastHistoryIndex: currentIndex,
        });

        page.on("popup", (dynamicPage) => {
          const event: WindowEvent = {
            action: "popup",
            page,
            popup: dynamicPage,
            value: dynamicPage.url(),
          };

          this.emit("windowevent", event);
        });

        page.on("framenavigated", async (frame) => {
          if (frame.parentFrame()) return;

          const { currentIndex, entries } = await session.send(
            "Page.getNavigationHistory"
          );
          const currentHistoryEntry = entries[currentIndex];
          const highestEntryId = entries.reduce(
            (highest, entry) => (entry.id > highest ? entry.id : highest),
            0
          );

          const {
            entriesById = new Map<number, Protocol.Page.NavigationEntry>(),
            lastHighestEntryId = 0,
            lastHistoryEntriesLength = 1,
            lastHistoryIndex = 0,
          } = this._pageNavigationHistory.get(page) || {};

          const lastEntryForSameId = entriesById.get(currentHistoryEntry.id);

          // We update entriesById only for the current entry
          entriesById.set(currentHistoryEntry.id, currentHistoryEntry);

          this._pageNavigationHistory.set(page, {
            entriesById,
            lastHighestEntryId: highestEntryId,
            lastHistoryEntriesLength: entries.length,
            lastHistoryIndex: currentIndex,
          });

          let action: WindowAction | undefined;
          let url: string | undefined;

          // Detecting a `goto` (typed address) is the most difficult. There are a few factors:
          // (1) The current history entry will have a transitionType of "typed"
          // (2) But if we click Back and this goes back to a previous entry that was originally
          //     typed, then it still has a transitionType of "typed".
          // (3) Also, entries may stay the same length but yet have a different typed address
          //     as the last entry, such as if we clicked Back and then entered a new address.
          //
          // The way we can detect these edge cases is by checking the `id` on the current entry
          // and also tracking when a new `id` has been generated. We do this by finding the
          // highest `id` because Chromium seems to always use an incrementing integer as the ID.
          //
          // If the current entry is both `typed` and has a newly-generated ID, then it is a `goto`
          // unless it's a blank page, in which case we'll catch the real goto on the next run.
          if (
            highestEntryId > lastHighestEntryId &&
            currentHistoryEntry.id === highestEntryId &&
            currentHistoryEntry.transitionType === "typed" &&
            !BLANK_URLS.includes(currentHistoryEntry.url)
          ) {
            // NEW ADDRESS ENTERED
            action = "goto";
            url = currentHistoryEntry.url;
          } else if (lastHistoryEntriesLength === entries.length) {
            if (
              // Sometimes the browser goes back while doing a reload. This
              // seems to be when client code has been pushing URLs into
              // history, but then we want to reload the original URL so
              // it moves back the current index first. So if we've moved
              // back but the entry we've moved back to is a "reload" and
              // wasn't a reload last time, consider this to be a reload.
              //
              // It's also a reload if current index stayed the same but
              // type changed to "reload".
              currentHistoryEntry.transitionType === "reload" &&
              lastEntryForSameId?.transitionType !== "reload"
            ) {
              // RELOAD
              action = "reload";
            } else if (currentIndex < lastHistoryIndex) {
              // BACK
              action = "goBack";
            } else if (currentIndex > lastHistoryIndex) {
              // FORWARD
              // action = 'goForward';
              // TODO: goForward works pretty well, but we can't currently tell the difference
              // between the user clicking the Forward button and the user re-clicking a link
              // that causes us to go forward in the history. So not implementing this yet.
            }
          }

          if (!action) return;

          const event: WindowEvent = {
            action,
            page,
            value: url,
          };

          this.emit("windowevent", event);
        });

        this._activeSessions.add(session);
      }
    });
  }
}
