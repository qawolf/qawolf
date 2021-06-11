import Debug from "debug";
import { EventEmitter } from "events";
import { BrowserContext, Frame, Page } from "playwright";

import { buildFrameSelector } from '../playwright'
import { ElementChooserValue, ElementChosen, ElementEvent, TextOperation, Variables, WindowEvent } from "../types";

const debug = Debug("qawolf:ElementChooser");

type BindingOptions = {
  frame: Frame;
  page: Page;
};

export type GetFrameOrPageVariableInput = {
  event: ElementChosen;
  variables: Variables;
};

export const getFrameOrPageVariable = ({
  event,
  variables,
}: GetFrameOrPageVariableInput): string => {
  const pageVariable = Object.keys(variables).find(
    (name) => variables[name] === event.page
  );

  if (!pageVariable) throw new Error("No matching page found");

  let frameVariable: string | undefined = undefined;

  if (event.frameSelector) {
    if (!event.frame) throw new Error("No frame provided");

    frameVariable = Object.keys(variables).find(
      (name) => variables[name] === event.frame
    );

    if (!frameVariable) throw new Error("No matching frame found");
  }

  return frameVariable || pageVariable
};

interface ElementChooserOptions {
  variables: Variables;
}

export class ElementChooser extends EventEmitter {
  _context?: BrowserContext;
  _contextEmitter?: EventEmitter;
  _isActive = false;
  _lastElementChosen: ElementChosen | null = null;
  _variables: Variables;

  constructor({ variables }: ElementChooserOptions) {
    super();
    this._variables = variables;
  }

  _setActive(value: boolean): void {
    this._isActive = value;

    if (!value) {
      // clear the previous chosen value
      this._lastElementChosen = null;
    }

    debug("emit %j", this.value);
    this.emit("elementchooser", this.value);
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
      debug("emit %j", this.value);

      if (this._isActive) {
        this.emit("elementchooser", this.value);
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

  async start(): Promise<void> {
    this._setActive(true);

    const promises = (this._context?.pages() || [])
      .filter((page) => !page.isClosed())
      .map((page) => {
        return page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const qawolf: any = (window as any).qawolf;
          qawolf.actionRecorder.stop();
          qawolf.elementChooser.start();
        });
      });

    await Promise.all(promises);
  }

  async stop(): Promise<void> {
    this._setActive(false);

    const promises = (this._context?.pages() || [])
      .filter((page) => !page.isClosed())
      .map((page) => {
        return page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const qawolf: any = (window as any).qawolf;
          qawolf.elementChooser.stop();
          qawolf.actionRecorder.start();
        });
      });

    await Promise.all(promises);
  }

  get value(): ElementChooserValue {
    let variable = "page";
    if (this._lastElementChosen) {
      variable = getFrameOrPageVariable({
        event: this._lastElementChosen,
        variables: this._variables,
      })
    }

    return {
      ...(this._lastElementChosen || {}),
      isActive: this._isActive,
      variable
    };
  }
}
