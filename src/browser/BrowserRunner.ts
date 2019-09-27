import { Browser } from "./Browser";
import { logger } from "../logger";
import { Callbacks, Runner } from "../Runner";
import { BrowserStep, Job } from "../types";

type ConstructorArgs = {
  callbacks?: Callbacks;
};

export class BrowserRunner extends Runner {
  private _browser: Browser;

  constructor({ callbacks }: ConstructorArgs = {}) {
    super(callbacks);
  }

  public get browser() {
    return this._browser;
  }

  public async close(): Promise<void> {
    await this._browser.close();
  }

  protected async beforeRun(job: Job): Promise<void> {
    this._browser = await Browser.create(job.url);
    await super.beforeRun(job);
  }

  protected async runStep(step: BrowserStep): Promise<void> {
    logger.debug(`runStep: ${JSON.stringify(step)}`);
    await this._browser.runStep(step);
  }
}
