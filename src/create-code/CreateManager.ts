import Debug from 'debug';
import { BrowserContext } from 'playwright-core';
import { buildSteps } from '../build-workflow/buildSteps';
import { CodeFileUpdater } from './CodeFileUpdater';
import { ContextEventCollector } from './ContextEventCollector';
import { createPrompt } from './createPrompt';
import { WatchHooks } from '../watch/WatchHooks';
import { ElementEvent } from '../types';

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

    codeUpdater.on('codeupdate', (code: string) => {
      WatchHooks.codeUpdate(code);
    });

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

  protected constructor(options: ConstructorOptions) {
    this._codeUpdater = options.codeUpdater;
    this._collector = options.collector;

    this._collector.on('elementevent', (event) => this.update(event));
  }

  protected async update(event: ElementEvent): Promise<void> {
    this._events.push(event);

    const steps = buildSteps(this._events);
    await this._codeUpdater.update({ steps });
  }

  public async finalize(): Promise<void> {
    const shouldSave = await createPrompt(this._codeUpdater.path());
    if (shouldSave === null) {
      // the prompt was cancelled since the test was re-run in a watch
      return;
    }

    if (shouldSave) {
      await this._codeUpdater.finalize();
    } else {
      await this._codeUpdater.discard();
    }

    // stop the watch since a prompt selection is made
    WatchHooks.stopWatch();
  }
}
