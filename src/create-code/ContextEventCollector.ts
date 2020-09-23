import Debug from 'debug';
import { EventEmitter } from 'events';
import { BrowserContext, Frame, Page, ChromiumBrowserContext, CDPSession } from 'playwright';
import { loadConfig } from '../config';
import { ElementEvent, WindowEvent, WindowEventName } from '../types';
import { IndexedPage } from '../utils/context/indexPages';
import { QAWolfWeb } from '../web';
import { DEFAULT_ATTRIBUTE_LIST } from '../web/attribute';
import { forEachFrame, forEachPage } from '../utils/context/forEach';
import { isRegistered } from '../utils/context/register';

const debug = Debug('qawolf:ContextEventCollector');

const BLANK_URLS = ['chrome://newtab/', 'about:blank'];

type BindingOptions = {
  frame: Frame;
  page: Page;
};

type FrameSelector = {
  index: number;
  selector: string;
};

type LastPageNavigation = {
  lastHighestEntryId: number;
  lastHistoryEntriesLength: number;
  lastHistoryIndex: number;
};

export const buildFrameSelector = async (
  frame: Frame,
  attributes: string[],
): Promise<string> => {
  // build the frame selector if this is one frame down from the parent
  const parentFrame = frame.parentFrame();

  if (parentFrame && !parentFrame.parentFrame()) {
    const frameElement = await frame.frameElement();

    const selector = await parentFrame.evaluate(
      ({ attributes, frameElement }) => {
        const web: QAWolfWeb = (window as any).qawolf;

        return web.buildSelector({
          attributes,
          isClick: false,
          target: frameElement as HTMLElement,
        });
      },
      { attributes, frameElement },
    );

    return selector;
  }

  return undefined;
};

export class ContextEventCollector extends EventEmitter {
  readonly _activeSessions = new Set<CDPSession>();
  readonly _attributes: string[];
  readonly _context: BrowserContext;
  readonly _frameSelectors = new Map<Frame, FrameSelector>();
  readonly _pageNavigationHistory = new Map<Page, LastPageNavigation>();

  public static async create(
    context: BrowserContext,
  ): Promise<ContextEventCollector> {
    const collector = new ContextEventCollector(context);
    await collector._create();
    return collector;
  }

  protected constructor(context: BrowserContext) {
    super();
    this._attributes = (loadConfig().attribute || DEFAULT_ATTRIBUTE_LIST).split(
      ',',
    );
    this._context = context;
  }

  async _create(): Promise<void> {
    if (!isRegistered(this._context)) {
      throw new Error('Use qawolf.register(context) first');
    }

    let frameIndex = 0;

    await forEachFrame(this._context, async ({ page, frame }) => {
      // eagerly build frame selectors so we have them after a page navigation
      try {
        if (frame.isDetached() || page.isClosed()) return;

        frameIndex += 1;

        const selector = await buildFrameSelector(frame, this._attributes);
        this._frameSelectors.set(frame, { index: frameIndex, selector });
      } catch (error) {
        debug(`cannot build frame selector: ${error.message}`);
      }
    });

    await this._context.exposeBinding(
      'qawElementEvent',
      async ({ frame, page }: BindingOptions, elementEvent: ElementEvent) => {
        const pageIndex = (page as IndexedPage).createdIndex;
        const event: ElementEvent = { ...elementEvent, page: pageIndex };

        const { index, selector } = this._frameSelectors.get(frame) || {};
        if (selector) {
          event.frameIndex = index;
          event.frameSelector = selector;
        }

        debug(`emit %j`, event);
        this.emit('elementevent', event);
      },
    );

    await forEachPage(this._context, async (page) => {
      const pageIndex = (page as IndexedPage).createdIndex;

      // Currently only ChromiumBrowserContext can do CDP, so we cannot support adding
      // new tabs manually or back/forward/reload on other browsers
      if ((this._context as ChromiumBrowserContext).newCDPSession) {
        const session = await (this._context as ChromiumBrowserContext).newCDPSession(page);
        const { currentIndex, entries } = await session.send("Page.getNavigationHistory");
        const highestEntryId = entries.reduce((highest, entry) => entry.id > highest ? entry.id : highest, 0);

        const currentHistoryEntry = entries[currentIndex];
        if (currentHistoryEntry.transitionType === 'typed' && !BLANK_URLS.includes(currentHistoryEntry.url)) {
          this.emit('windowevent', {
            name: 'goto',
            page: pageIndex,
            time: Date.now(),
            value: currentHistoryEntry.url,
          });
        }

        this._pageNavigationHistory.set(page, {
          lastHighestEntryId: highestEntryId,
          lastHistoryEntriesLength: entries.length,
          lastHistoryIndex: currentIndex,
        });

        page.on('framenavigated', async (frame) => {
          if (frame.parentFrame()) return;

          const { currentIndex, entries } = await session.send("Page.getNavigationHistory");
          const currentHistoryEntry = entries[currentIndex];
          const highestEntryId = entries.reduce((highest, entry) => entry.id > highest ? entry.id : highest, 0);

          const {
            lastHighestEntryId,
            lastHistoryEntriesLength,
            lastHistoryIndex,
          } = this._pageNavigationHistory.get(page);

          this._pageNavigationHistory.set(page, {
            lastHighestEntryId: highestEntryId,
            lastHistoryEntriesLength: entries.length,
            lastHistoryIndex: currentIndex,
          });

          let name: WindowEventName;
          let url: string;

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
            currentHistoryEntry.transitionType === 'typed' &&
            !BLANK_URLS.includes(currentHistoryEntry.url)
          ) {
            // NEW ADDRESS ENTERED
            name = 'goto';
            url = currentHistoryEntry.url;
          } else if (lastHistoryEntriesLength === entries.length) {
            if (currentIndex < lastHistoryIndex) {
              // BACK
              name = 'goBack';
            } else if (currentIndex > lastHistoryIndex) {
              // FORWARD
              // name = 'goForward';
              // TODO: goForward works pretty well, but we can't currently tell the difference
              // between the user clicking the Forward button and the user re-clicking a link
              // that causes us to go forward in the history. So not implementing this yet.
            } else if (currentIndex === lastHistoryIndex && currentHistoryEntry.transitionType === 'reload') {
              // RELOAD
              name = 'reload';
            }
          }

          if (!name) return;

          const event: WindowEvent = {
            name,
            page: pageIndex,
            time: Date.now(),
            value: url,
          };

          this.emit('windowevent', event);
        });

        this._activeSessions.add(session);
      } else if (pageIndex === 0) {
        this.emit('windowevent', {
          name: 'goto',
          page: 0,
          time: Date.now(),
          value: page.url(),
        });
      }
    });
  }
}
