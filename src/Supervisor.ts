import Browser from "./Browser";

export class Supervisor {
  /**
   * Inject and supervise the Executor while it runs the workflow.
   */
  private _browser: Browser;

  constructor(browser: Browser) {
    this._browser = browser;
  }

  async run() {
    // XXX create websocket server for communication
    await this._browser.injectSdk();

    // TODO inject library in browser
    // TODO reinject on disconnect
    // TODO track progress
  }
}
