import {
  Browser,
  click,
  hasText,
  input,
  retryExecutionError,
  scrollElement
} from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ScreenCapture } from "@qawolf/screen";
import {
  AssertOptions,
  ScrollValue,
  Step,
  StepValue,
  Workflow
} from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { getStepValues } from "./getStepValues";
import { getUrl } from "./getUrl";

export class Runner {
  protected _browser: Browser;
  protected _screenCapture: ScreenCapture | null = null;
  protected _values: StepValue[];
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

  public async click(step: Step) {
    logger.verbose(`Runner: click step ${step.index}`);

    await retryExecutionError(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await click(element);
    });
  }

  public async close() {
    logger.verbose("Runner: close");

    if (this._screenCapture) {
      await this._screenCapture.stop();
    }

    await this._browser.close();
  }

  public async hasText(
    text: string,
    options?: AssertOptions
  ): Promise<boolean> {
    logger.verbose(`Assertion: current page has text ${text}`);
    const page = await this._browser.currentPage();

    return hasText(page, text, options);
  }

  public async input(step: Step, value?: StepValue) {
    logger.verbose(`Runner: input step ${step.index}`);

    await retryExecutionError(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await input(element, value as (string | null));
    });
  }

  public async run() {
    for (let step of this._workflow.steps) {
      await this.runStep(step);
    }
  }

  public async runStep(step: Step) {
    if (step.action === "click") {
      await this.click(step);
    } else if (step.action === "input") {
      await this.input(step, this._values[step.index] as
        | string
        | null
        | undefined);
    } else if (step.action === "scroll") {
      await this.scrollElement(step, this._values[step.index] as ScrollValue);
    }
  }

  public async scrollElement(step: Step, value: StepValue) {
    logger.verbose(`Runner: scroll step ${step.index}`);

    await retryExecutionError(async () => {
      const element = await this._browser.element(step);
      await this.beforeAction();
      await scrollElement(element, value as ScrollValue, CONFIG.findTimeoutMs);
    });
  }

  private async beforeAction() {
    if (CONFIG.sleepMs) {
      await sleep(CONFIG.sleepMs);
    }
  }
}
