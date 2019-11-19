import {
  Browser,
  BrowserCreateOptions,
  click,
  findProperty,
  FindPropertyArgs,
  focusClear,
  hasText,
  retryExecutionError,
  scroll,
  select,
  type
} from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ScreenCapture } from "@qawolf/screen";
import { ScrollValue, Step, StepValue, Workflow } from "@qawolf/types";
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

    const options: BrowserCreateOptions = { size: workflow.size };
    if (CONFIG.domPath) options.domPath = `${CONFIG.domPath}/${workflow.name}`;

    self._browser = await Browser.create(options);
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
      const element = await this.beforeAction(step);
      await click(element!);
    });
  }

  public async close() {
    logger.verbose("Runner: close");

    if (this._screenCapture) {
      await this._screenCapture.stop();
    }

    await this._browser.close();
  }

  public async findProperty(
    { property, selector }: FindPropertyArgs,
    timeoutMs?: number
  ): Promise<string | null | undefined> {
    logger.verbose(`Runner: findProperty ${property} of element ${selector}`);
    const page = await this._browser.currentPage();

    return findProperty(page, { property, selector }, timeoutMs);
  }

  public async hasText(text: string, timeoutMs?: number): Promise<boolean> {
    logger.verbose(`Runner: hasText ${text}`);

    const page = await this._browser.currentPage();
    return hasText(page, text, timeoutMs);
  }

  public async run() {
    for (let step of this._workflow.steps) {
      await this.runStep(step);
    }
  }

  public async runStep(step: Step) {
    if (step.action === "click") {
      await this.click(step);
    } else if (step.action === "type") {
      await this.type(step, this._values[step.index] as
        | string
        | null
        | undefined);
    } else if (step.action === "scroll") {
      await this.scroll(step, this._values[step.index] as ScrollValue);
    }
  }

  public async scroll(step: Step, value: StepValue) {
    logger.verbose(`Runner: scroll step ${step.index}`);

    await retryExecutionError(async () => {
      const element = await this.beforeAction(step);
      await scroll(element!, value as ScrollValue, CONFIG.findTimeoutMs);
    });
  }

  public async select(step: Step, value: StepValue) {
    logger.verbose(`Runner: select step ${step.index}`);

    await retryExecutionError(async () => {
      const element = await this.beforeAction(step);
      await select(element!, value as string);
    });
  }

  public async type(step: Step, value?: StepValue) {
    logger.verbose(`Runner: type step ${step.index}`);

    const typeValue = value as (string | null);

    await retryExecutionError(async () => {
      // do not focus or clear for Enter or Tab
      const shouldFocusClear =
        !typeValue ||
        !(typeValue.startsWith("↓Enter") || typeValue.startsWith("↓Tab"));

      const element = await this.beforeAction(shouldFocusClear ? step : null);
      if (shouldFocusClear) {
        await focusClear(element!);
      }

      const page = await this._browser.getPage(step.pageId);
      if (typeValue) await type(page, typeValue);
    });
  }

  private async beforeAction(step: Step | null) {
    logger.verbose(`Runner: beforeAction`);
    let element = step ? await this._browser.element(step) : null;

    if (CONFIG.sleepMs) {
      logger.verbose(`Runner: beforeAction sleep ${CONFIG.sleepMs} ms`);
      await sleep(CONFIG.sleepMs);

      // reload the element in case it changed since the sleep
      if (step) {
        logger.verbose("Runner: beforeAction reload element after sleep");
        element = await this._browser.element(step, false, 0);
      }
    }

    return element;
  }
}
