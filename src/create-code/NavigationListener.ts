import Debug from 'debug';
import { ChromiumBrowserContext, Page } from 'playwright';
import { EventEmitter } from 'events';

const debug = Debug('qawolf:NavigationListener');

type ConstructorOptions = {
  context: ChromiumBrowserContext;
  page: Page;
};

export class NavigationListener extends EventEmitter {
  private _context: ChromiumBrowserContext;
  private _page: Page;
  public constructor(
    options: ConstructorOptions,
  ) {
    super()
    this._context = options.context
    this._page = options.page
  }

  public async init(): Promise<void> {
    debug("listening for new events")
    await this.listenForFrameNavigations();
  }
  private async listenForFrameNavigations(): Promise<void> {
    const cdpSession = await this._context.newCDPSession(this._page)

    let lastHistoryIndex = 0
    let lastHistoryEntriesLength = 0
    this._page.on("framenavigated", async (frame) => {
      // Only consider the top frame window
      if (frame.parentFrame() !== null) {
        return
      }

      const history = await cdpSession.send("Page.getNavigationHistory")
      const currentHistoryEntry = history.entries[history.currentIndex]

      // Sometimes they appear multiple times, because we listen not really for navigation changes
      if (lastHistoryIndex === history.currentIndex) {
        return
      }
      /**
       * We only want to track new 'goto' events if the user has actually typed in something and the
       * size of the history will increase if so.
       */
      if (currentHistoryEntry.transitionType === "typed" && lastHistoryEntriesLength < history.entries.length) {
        console.log({
          kind: "goto",
          value: frame.url()
        })
        // For forward and backwards determination the history will keep the same length
      } else if (lastHistoryEntriesLength === history.entries.length) {
        if (history.currentIndex < lastHistoryIndex) {
          console.log({
            kind: "goBack"
          })
        } else if (history.currentIndex > lastHistoryIndex) {
          console.log({
            kind: "goForward"
          })
        }
      }
      lastHistoryIndex = history.currentIndex
      lastHistoryEntriesLength = history.entries.length
    })
  }
}