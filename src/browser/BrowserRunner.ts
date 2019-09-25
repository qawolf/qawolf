import { Browser, Page, Serializable } from "puppeteer";
import { createPage } from "./browser";
import { Callbacks, Runner } from "../Runner";
import { BrowserStep, Job } from "../types";
import { QAWolf } from "../web";

type ConstructorArgs = {
  callbacks?: Callbacks;
};

export class BrowserRunner extends Runner {
  private _browser: Browser;
  private _currentPageIndex: number = 0;
  private _pages: Page[] = [];

  constructor({ callbacks }: ConstructorArgs = {}) {
    super(callbacks);
  }

  public get currentPage() {
    return this._pages[this._currentPageIndex];
  }

  public async close(): Promise<void> {
    await this._browser.close();
  }

  protected async beforeRun(job: Job): Promise<void> {
    const page = await createPage(job.url);
    this._browser = page.browser();
    this._pages.push(page);

    await super.beforeRun(job);
  }

  protected async runStep(step: BrowserStep): Promise<void> {
    const page = await this.getPage(step.pageId);

    try {
      await page.evaluate(
        step => {
          const qawolf: QAWolf = (window as any).qawolf;
          return qawolf.runStep(step);
        },
        step as Serializable
      );
    } catch (error) {
      if (
        error.message ===
        "Execution context was destroyed, most likely because of a navigation."
      ) {
        // re-run the step if the page navigates
        return this.runStep(step);
      }

      throw error;
    }
  }

  private async getPage(index: number = 0) {
    // TODO if index > this._pages lookup page...

    const page = this._pages[index];
    this._currentPageIndex = index;
    return page;
  }
}
