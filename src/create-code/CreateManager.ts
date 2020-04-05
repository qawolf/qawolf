import Debug from 'debug';
import { BrowserContext } from 'playwright';
import { buildSteps } from '../build-workflow/buildSteps';
import { CodeFileUpdater } from './CodeFileUpdater';
import { ContextEventCollector } from './ContextEventCollector';
import { createPrompt } from './createPrompt';
import { SelectorFileUpdater } from './SelectorFileUpdater';
import { ElementEvent } from '../types';
import { WatchHooks } from '../watch/WatchHooks';

type CreateCliOptions = {
  codePath: string;
  context: BrowserContext;
  selectorPath: string;
};

type ConstructorOptions = {
  codeUpdater: CodeFileUpdater;
  collector: ContextEventCollector;
  selectorUpdater: SelectorFileUpdater;
};

const debug = Debug('qawolf:CreateManager');

export class CreateManager {
  public static async create(
    options: CreateCliOptions,
  ): Promise<CreateManager> {
    debug(
      `create code at ${options.codePath} selectors at ${options.selectorPath}`,
    );

    const codeUpdater = await CodeFileUpdater.create(options.codePath);

    codeUpdater.on('codeupdate', (code: string) => {
      WatchHooks.codeUpdate(code);
    });

    const selectorUpdater = await SelectorFileUpdater.create(
      options.selectorPath,
    );

    const collector = await ContextEventCollector.create({
      context: options.context,
    });

    const manager = new CreateManager({
      codeUpdater,
      collector,
      selectorUpdater,
    });

    return manager;
  }

  private _codeUpdater: CodeFileUpdater;
  private _collector: ContextEventCollector;
  private _events: ElementEvent[] = [];
  private _selectorUpdater: SelectorFileUpdater;
  private _stepStartIndex: number;

  protected constructor(options: ConstructorOptions) {
    this._codeUpdater = options.codeUpdater;
    this._collector = options.collector;
    this._selectorUpdater = options.selectorUpdater;

    // push step index behind existing selectors
    this._stepStartIndex = Object.keys(
      this._selectorUpdater.selectors(),
    ).length;

    this._collector.on('elementevent', (event) => this.update(event));
  }

  protected async update(event: ElementEvent): Promise<void> {
    this._events.push(event);

    const steps = buildSteps(this._events, this._stepStartIndex);

    await Promise.all([
      this._codeUpdater.update({ steps }),
      this._selectorUpdater.update({ steps }),
    ]);
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
      await this._selectorUpdater.discard();
    }

    // stop the watch sicne a prompt selection is made
    WatchHooks.stopWatch();
  }
}
