import { Browser, click, input, retryAsync, scroll } from "@qawolf/browser";
import { BrowserStep, Job } from "@qawolf/types";

export class Runner {
  protected _browser: Browser;
  protected _job: Job;
  protected constructor() {}

  public static async create(job: Job) {
    /**
     * An async constructor for Runner.
     */

    // TODO get values for job based on name QAW_NAME_0..N
    const self = new Runner();
    self._browser = await Browser.create({ size: job.size, url: job.url });
    self._job = job;

    return self;
  }

  public get browser() {
    return this._browser;
  }

  public async click(step: BrowserStep) {
    await retryAsync(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await click(element);
    });
  }

  public close() {
    return this._browser.close();
  }

  public async input(step: BrowserStep, value?: string) {
    await retryAsync(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await input(element, value);
    });
  }

  public async run() {
    for (let step of this._job.steps) {
      await this.step(step);
    }
  }

  public async scroll(step: BrowserStep) {
    await retryAsync(async () => {
      await this.beforeAction();
      const page = await this._browser.getPage(step.pageId, true);
      await scroll(page, step.scrollTo!);
    });
  }

  public async step(step: BrowserStep) {
    if (step.action === "click") {
      await this.click(step);
    } else if (step.action === "input") {
      await this.input(step, step.value);
    } else if (step.action === "scroll") {
      await this.scroll(step);
    }
  }

  private async beforeAction() {
    // TODO screenshot(this._stepIndex)
  }
}
