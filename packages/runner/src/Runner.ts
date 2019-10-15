import { Browser, click, input, retryAsync, scroll } from "@qawolf/browser";
import { BrowserStep, Job } from "@qawolf/types";
import { getStepValues } from "./getStepValues";
import { getUrl } from "./getUrl";

export class Runner {
  protected _browser: Browser;
  protected _job: Job;
  protected _values: (string | undefined)[];

  protected constructor() {}

  public static async create(job: Job) {
    /**
     * An async constructor for Runner.
     */

    const self = new Runner();

    // replace the url w/ env variable if it exists
    job.url = getUrl(job);

    self._browser = await Browser.create({ size: job.size, url: job.url });
    self._job = job;
    self._values = getStepValues(job);

    return self;
  }

  public get browser() {
    return this._browser;
  }

  public get job() {
    return this._job;
  }

  public get values() {
    return this._values;
  }

  public async click(step: BrowserStep) {
    await retryAsync(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await click(element);
    });
  }

  public async close() {
    await this._browser.close();
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
      await this.runStep(step);
    }
  }

  public async runStep(step: BrowserStep) {
    if (step.action === "click") {
      await this.click(step);
    } else if (step.action === "input") {
      await this.input(step, this._values[step.index]);
    } else if (step.action === "scroll") {
      await this.scroll(step);
    }
  }

  public async scroll(step: BrowserStep) {
    await retryAsync(async () => {
      await this.beforeAction();
      const page = await this._browser.getPage(step.pageId, true);
      await scroll(page, step.scrollTo!);
    });
  }

  private async beforeAction() {
    // TODO screenshot(this._stepIndex)
  }
}
