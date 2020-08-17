import Debug from 'debug';
import { EventEmitter } from 'events';
import { BrowserContext, Frame, Page } from 'playwright';
import { loadConfig } from '../config';
import { ElementEvent } from '../types';
import { IndexedPage } from '../utils/context/indexPages';
import { QAWolfWeb } from '../web';
import { DEFAULT_ATTRIBUTE_LIST } from '../web/attribute';
import { isRegistered } from '../utils/context/register';

const debug = Debug('qawolf:ContextEventCollector');

type BindingOptions = {
  frame: Frame;
  page: Page;
};

export const buildFrameSelector = async (
  frame: Frame,
  attributes: string[],
): Promise<string> => {
  // build the frame selector if this is one frame down from the parent
  const parentFrame = frame.parentFrame();

  if (parentFrame && !parentFrame.parentFrame()) {
    const frameElement = await frame.frameElement();

    const frameSelector = await parentFrame.evaluate(
      ({ attributes, frameElement }) => {
        const web: QAWolfWeb = (window as any).qawolf;

        return web.buildSelector({
          attributes,
          isClick: false,
          target: frameElement as HTMLElement,
        });
      },
      { attributes, frameElement },
    );

    return frameSelector;
  }

  return undefined;
};

export class ContextEventCollector extends EventEmitter {
  readonly _attributes: string[];
  readonly _context: BrowserContext;

  public static async create(
    context: BrowserContext,
  ): Promise<ContextEventCollector> {
    const collector = new ContextEventCollector(context);
    await collector._emitEvents();
    return collector;
  }

  protected constructor(context: BrowserContext) {
    super();
    this._attributes = (loadConfig().attribute || DEFAULT_ATTRIBUTE_LIST).split(
      ',',
    );
    this._context = context;
  }

  async _emitEvents(): Promise<void> {
    if (!isRegistered(this._context)) {
      throw new Error('Use qawolf.register(context) first');
    }

    await this._context.exposeBinding(
      'qawElementEvent',
      async ({ frame, page }: BindingOptions, elementEvent: ElementEvent) => {
        const pageIndex = (page as IndexedPage).createdIndex;
        const event: ElementEvent = { ...elementEvent, page: pageIndex };
        debug(`emit %j`, event);

        event.frameSelector = await buildFrameSelector(frame, this._attributes);
        this.emit('elementevent', event);
      },
    );
  }
}
