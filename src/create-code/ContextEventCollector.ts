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

type BindingOptions = {
  frame: Frame;
  page: Page;
};

type FrameSelector = {
  index: number;
  selector: string;
};

type LastPageNavigation = {
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
      if ((this._context as any)._browser._options.name === 'chromium') {
        const session = await (this._context as ChromiumBrowserContext).newCDPSession(page);
        const { currentIndex, entries } = await session.send("Page.getNavigationHistory");

        const currentHistoryEntry = entries[currentIndex];
        if (currentHistoryEntry.transitionType === 'typed' && currentHistoryEntry.url !== 'chrome://newtab/') {
          this.emit('windowevent', {
            name: 'goto',
            page: pageIndex,
            time: Date.now(),
            value: currentHistoryEntry.url,
          });
        }

        this._pageNavigationHistory.set(page, {
          lastHistoryIndex: currentIndex,
          lastHistoryEntriesLength: entries.length,
        });

        page.on('framenavigated', async (frame) => {
          if (frame.parentFrame()) return;

          const { currentIndex, entries } = await session.send("Page.getNavigationHistory");
          const currentHistoryEntry = entries[currentIndex];

          const { lastHistoryEntriesLength, lastHistoryIndex } = this._pageNavigationHistory.get(page);

          let name: WindowEventName;
          let url: string;

          if (entries.length > lastHistoryEntriesLength && currentHistoryEntry.transitionType === 'typed') {
            // NEW ADDRESS ENTERED
            name = 'goto';
            url = currentHistoryEntry.url;
          } else if (lastHistoryEntriesLength === entries.length) {
            if (currentIndex < lastHistoryIndex) {
              // BACK
              name = 'goBack';
            } else if (currentIndex > lastHistoryIndex) {
              // FORWARD OR NEW ADDRESS ENTERED
              name = 'goForward';
            } else if (currentIndex === lastHistoryIndex && currentHistoryEntry.transitionType === 'reload') {
              // RELOAD
              name = 'reload';
            }
          }

          this._pageNavigationHistory.set(page, {
            lastHistoryIndex: currentIndex,
            lastHistoryEntriesLength: entries.length,
          });

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
