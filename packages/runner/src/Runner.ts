import { Browser, retryAsync } from "@qawolf/browser";
// todo export this...
import { BrowserStep } from "@qawolf/web";

export class Runner {
  private _browser: Browser;

  protected constructor(browser: Browser) {
    this._browser = browser;
  }

  static async create(job: Job) {
    /**
     * An async constructor for Runner.
     */

    // TODO BrowserCreateOptions for job
    // TODO get values for job based on name QAW_NAME_0..N
    const browser = await Browser.create(options);
    const self = new Runner(browser);
    return self;
  }

  public get browser() {
    return this._browser;
  }

  public async click(step: BrowserStep) {
    await retryAsync(async () => {
      // todo log each step inside their method...
      const element = await this._browser.element(step);
      await this.beforeAction();
      await click(element);
    });

    // this._stepIndex += 1
  }

  public close() {
    return this._browser.close();
  }

  public async input() {
    await retryAsync(async () => {
      const element = await this._browser.element(target, step.pageIndex);
      await this.beforeAction();
      await input(element);
    });
  }

  public async run() {
    // TODO...
    // this._job.steps.forEach()
  }

  private async beforeAction() {
    // TODO screenshot(this._stepIndex)
  }
}
