import Debug from 'debug';
import { BrowserContext } from 'playwright';
import { buildSteps } from '../build-workflow/buildSteps';
import { CodeFileUpdater } from './CodeFileUpdater';
import { ContextEventCollector } from './ContextEventCollector';
import { createPrompt } from './createPrompt';
import { ElementEvent, PageEvent, WindowEvent } from '../types';

type CreateCliOptions = {
  codePath: string;
  context: BrowserContext;
};

type ConstructorOptions = {
  codeUpdater: CodeFileUpdater;
  collector: ContextEventCollector;
};

const debug = Debug('qawolf:CreateManager');

export class CreateManager {
  public static async create(
    options: CreateCliOptions,
  ): Promise<CreateManager> {
    debug(`create code at ${options.codePath}`);

    const codeUpdater = await CodeFileUpdater.create(options.codePath);

    const collector = await ContextEventCollector.create(options.context);

    const manager = new CreateManager({
      codeUpdater,
      collector,
    });

    return manager;
  }

  private _codeUpdater: CodeFileUpdater;
  private _collector: ContextEventCollector;
  private _events: ElementEvent[] = [];
  private _windowEvents: WindowEvent[] = [];

  protected constructor(options: ConstructorOptions) {
    this._codeUpdater = options.codeUpdater;
    this._collector = options.collector;

    this._collector.on('elementevent', (event) => this.update(event));
    this._collector.on('windowevent', (event) => this.update(event, true));
  }

  protected async update(event: PageEvent, isWindowEvent = false): Promise<void> {
    if (isWindowEvent) {
      this._windowEvents.push(event as WindowEvent);
    } else {
      this._events.push(event as ElementEvent);
    }

    const steps = buildSteps(this._events, this._windowEvents);
    await this._codeUpdater.update({ steps });
  }

  public async finalize(): Promise<void> {
    const shouldSave = await createPrompt(this._codeUpdater.path());

    if (shouldSave) {
      await this._codeUpdater.finalize();
    } else {
      await this._codeUpdater.discard();
    }
  }
}
