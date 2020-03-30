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
      // Only consider the top frame
      if (frame.parentFrame() !== null) {
        return
      }
      const history = await cdpSession.send("Page.getNavigationHistory")
      // Skip if the user will click on a link. Maybe whitelist makes more sense
      // than a blacklist here
      if (history.entries[history.currentIndex].transitionType === "link") {
        return
      }
      // Sometimes they appear multiple times, because we listen not really for navigation changes
      if (lastHistoryIndex === history.currentIndex) {
        return
      }
      if (history.currentIndex < lastHistoryIndex) {
        console.log({
          kind: "goBack"
        })
      } else if (history.currentIndex > lastHistoryIndex && lastHistoryEntriesLength === history.entries.length) {
        console.log({
          kind: "goForward"
        })
      } else {
        console.log({
          kind: "goto",
          value: frame.url()
        })
      }

      lastHistoryIndex = history.currentIndex
      lastHistoryEntriesLength = history.entries.length
    })
  }
}