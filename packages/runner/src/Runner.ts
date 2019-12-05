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
  Selector,
  type
} from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ScreenCapture } from "@qawolf/screen";
import { Action, ScrollValue, Step, StepValue, Workflow } from "@qawolf/types";
import { isNil, sleep } from "@qawolf/web";
import { getEnvValues } from "./getEnvValues";
import { getUrl } from "./getUrl";

export class Runner {
  protected _browser: Browser;
  protected _envValues: StepValue[];
  protected _screenCapture: ScreenCapture | null = null;
  protected _workflow: Workflow;

  protected constructor() {}

  public static async create(workflow: Workflow) {
    /**
     * An async constructor for Runner.
     */
    logger.verbose(`Runner: create for ${workflow.name}`);

    const self = new Runner();

    // replace the url w/ env variable if it exists
    workflow.url = getUrl(workflow);

    const options: BrowserCreateOptions = { size: workflow.size };
    if (CONFIG.domPath) options.domPath = `${CONFIG.domPath}/${workflow.name}`;

    self._browser = await Browser.create(options);
    self._envValues = getEnvValues(workflow);
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

    try {
      await self._browser.goto(workflow.url);
    } catch (error) {
      logger.error(`Runner: could not goto ${workflow.url}: ${error}`);

      // finish the video
      await self.close();

      throw error;
    }

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

  public async click(selectorOrStep: Selector | Step) {
    logger.verbose("Runner: click");

    await retryExecutionError(async () => {
      const element = await this.beforeAction(selectorOrStep, "click");
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

  public getValue<T extends StepValue>(index: number | undefined, value: T): T {
    if (isNil(index)) return value;

    const envValue = this._envValues[index!] as T;
    if (isNil(envValue)) return value;

    return envValue;
  }

  public async hasText(text: string, timeoutMs?: number): Promise<boolean> {
    logger.verbose(`Runner: hasText ${text}`);

    const page = await this._browser.currentPage();
    return hasText(page, text, timeoutMs);
  }

  public async scroll(selectorOrStep: Selector | Step, value: ScrollValue) {
    logger.verbose("Runner: scroll");

    await retryExecutionError(async () => {
      const element = await this.beforeAction(selectorOrStep, "scroll");
      await scroll(
        element!,
        this.getValue((selectorOrStep as Step).index, value),
        CONFIG.findTimeoutMs
      );
    });
  }

  public async select(selectorOrStep: Selector | Step, value: string | null) {
    logger.verbose("Runner: select");

    await retryExecutionError(async () => {
      const element = await this.beforeAction(selectorOrStep, "select");
      await select(
        element!,
        this.getValue((selectorOrStep as Step).index, value)
      );
    });
  }

  public async type(
    selectorOrStep: Selector | Step,
    value: string | null = null
  ) {
    logger.verbose("Runner: type");

    const typeValue = this.getValue((selectorOrStep as Step).index, value);

    await retryExecutionError(async () => {
      const shouldFocusClear =
        // clear when there is no type value
        !typeValue ||
        // do not focus or clear for Enter or Tab
        !(typeValue.startsWith("↓Enter") || typeValue.startsWith("↓Tab"));

      const element = await this.beforeAction(
        shouldFocusClear ? selectorOrStep : null,
        "type"
      );
      if (shouldFocusClear) {
        await focusClear(element!);
      }

      const page = await this._browser.getPage(
        (selectorOrStep as Step).page || 0
      );
      if (typeValue) await type(page, typeValue);
    });
  }

  private async beforeAction(
    selectorOrStep: Selector | Step | null,
    action: Action
  ) {
    logger.verbose("Runner: beforeAction");

    let element = selectorOrStep
      ? await this._browser.find(selectorOrStep, {
          action,
          timeoutMs: CONFIG.findTimeoutMs
        })
      : null;

    if (CONFIG.sleepMs) {
      logger.verbose(`Runner: beforeAction sleep ${CONFIG.sleepMs} ms`);
      await sleep(CONFIG.sleepMs);

      // reload the element in case it changed since the sleep
      if (selectorOrStep) {
        logger.verbose("Runner: beforeAction reload element after sleep");

        try {
          // try to find it immediately
          element = await this._browser.find(selectorOrStep, {
            action,
            timeoutMs: 0,
            waitForRequests: false
          });
        } catch (e) {
          // if it cannot be found immediately wait longer
          element = await this._browser.find(selectorOrStep, {
            action,
            timeoutMs: CONFIG.findTimeoutMs,
            waitForRequests: false
          });
        }
      }
    }

    return element;
  }
}
