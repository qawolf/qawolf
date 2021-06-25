import Debug from "debug";
import { EventEmitter } from "events";
import { BrowserContext, Frame, Page } from "playwright";

import { CodeModel } from "../code/CodeModel";
import { parseActionExpressions } from "../code/parseCode";
import { prepareSourceVariables } from "../code/prepareSourceVariables";
import { buildFrameSelector } from '../playwright'
import { ElementChooserValue, ElementChosen, Variables } from "../types";

const debug = Debug("qawolf:ElementChooser");

type BindingOptions = {
  frame: Frame;
  page: Page;
};

interface ElementChooserOptions {
  codeModel: CodeModel;
  variables: Variables;
}

export class ElementChooser extends EventEmitter {
  _codeModel: CodeModel;
  _context?: BrowserContext;
  _contextEmitter?: EventEmitter;
  _isActive = false;
  _lastElementChosen: ElementChosen | null = null;
  _variables: Variables;

  constructor({ codeModel, variables }: ElementChooserOptions) {
    super();
    this._codeModel = codeModel;
    this._variables = variables;
  }

  _setActive(value: boolean): void {
    this._isActive = value;

    if (!value) {
      // clear the previous chosen value
      this._lastElementChosen = null;
    }

    const val = this.value;
    debug("emit %j", val);
    this.emit("elementchooser", val);
  }

  async setContext(context: BrowserContext): Promise<void> {
    this._context = context;
    this._setActive(false);

    // stop emitting chooser values
    this._contextEmitter?.removeAllListeners();

    // emit to a separate emitter per context
    const contextEmitter = new EventEmitter();
    this._contextEmitter = contextEmitter;

    contextEmitter.on("qawElementChosen", (event: ElementChosen) => {
      this._lastElementChosen = event;

      const val = this.value;
      debug("emit %j", val);
      if (this._isActive) {
        this.emit("elementchooser", val);
      }
    });

    await context.exposeBinding("qawElementChosen", async ({ frame, page }: BindingOptions, recorderEvent: Omit<ElementChosen, 'page'>) => {
      const event: ElementChosen = { ...recorderEvent, page };

      const frameSelector = await buildFrameSelector(frame);
      if (frameSelector) {
        event.frame = frame;
        event.frameSelector = frameSelector;
      }
      
      contextEmitter.emit("qawElementChosen", event)
    });
  }

  async _evalOnEveryFrame(frameEvalFn: () => void): Promise<void> {
    const allFrames = (this._context?.pages() || [])
    .filter((page) => !page.isClosed())
    .map((page) => page.frames())
    .flat()

    const promises = allFrames.map((frame) => frame.evaluate(frameEvalFn));
    await Promise.all(promises);
  }

  async start(): Promise<void> {
    this._setActive(true);

    await this._evalOnEveryFrame(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qawolf: any = (window as any).qawolf;
      qawolf.actionRecorder.stop();
      qawolf.elementChooser.start();
    });
  }

  async stop(): Promise<void> {
    this._setActive(false);

    await this._evalOnEveryFrame(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qawolf: any = (window as any).qawolf;
      qawolf.elementChooser.stop();
      qawolf.actionRecorder.start();
    });
  }

  get value(): ElementChooserValue {
    if (!this._lastElementChosen) {
      return { isActive: this._isActive };
    }

    const { initializeCode, variable = "page" } = prepareSourceVariables({
      // Don't add reference to this._variables or any initializeCode
      // will get lost by the time the snippet is inserted.
      declare: false,
      expressions: parseActionExpressions(this._codeModel.value),
      event: this._lastElementChosen,
      shouldBringPageToFront: true,
      // There should never be a case when a page variable doesn't
      // already exist since the page must be already loaded to
      // choose on it (I think)
      shouldDeclarePageVariable: false,
      variables: this._variables,
    })

    return {
      ...this._lastElementChosen,
      initializeCode,
      isActive: this._isActive,
      variable
    };
  }
}
