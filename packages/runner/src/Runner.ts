import {
  Browser,
  click,
  input,
  retryExecutionError,
  scroll
} from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { ScreenCapture } from "@qawolf/screen";
import { BrowserStep, Workflow } from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { getStepValues } from "./getStepValues";
import { getUrl } from "./getUrl";

export class Runner {
  protected _browser: Browser;
  protected _screenCapture: ScreenCapture | null = null;
  protected _values: (string | null | undefined)[];
  protected _workflow: Workflow;

  protected constructor() {}

  public static async create(workflow: Workflow) {
    /**
     * An async constructor for Runner.
     */

    const self = new Runner();

    // replace the url w/ env variable if it exists
    workflow.url = getUrl(workflow);

    self._browser = await Browser.create({ size: workflow.size });
    self._values = getStepValues(workflow);
    self._workflow = workflow;

    if (CONFIG.videoPath) {
      const device = self._browser.device;

      self._screenCapture = await ScreenCapture.start({
        offset: {
          x: CONFIG.chromeOffsetX,
          y: CONFIG.chromeOffsetY
        },
        savePath: `${CONFIG.videoPath}/${workflow.name}`,
        size: {
          height: device.viewport.height,
          width: device.viewport.width
        }
      });
    }

    await self._browser.goto(workflow.url);

    return self;
  }

  public get browser() {
    return this._browser;
  }

  public get workflow() {
    return this._workflow;
  }

  public get screenCapture() {
    return this._screenCapture;
  }

  public get values() {
    return this._values;
  }

  public async click(step: BrowserStep) {
    await retryExecutionError(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await click(element);
    });
  }

  public async close() {
    if (this._screenCapture) {
      await this._screenCapture.stop();
    }

    await this._browser.close();
  }

  public async input(step: BrowserStep, value?: string | null) {
    await retryExecutionError(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await input(element, value);
    });
  }

  public async run() {
    for (let step of this._workflow.steps) {
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
    await retryExecutionError(async () => {
      await this.beforeAction();
      const page = await this._browser.getPage(step.pageId, true);
      await scroll(page, step.scrollTo!);
    });
  }

  private async beforeAction() {
    if (CONFIG.sleepMs) {
      await sleep(CONFIG.sleepMs);
    }
  }
}
