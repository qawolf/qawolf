import Debug from 'debug';
import { outputJson, remove, pathExists, readJson } from 'fs-extra';
import { buildSelectors } from '../build-code/buildSelectors';
import { Selectors, Step } from '../types';
import { Registry } from '../utils';

const debug = Debug('qawolf:SelectorFileUpdater');

type ConstructorOptions = {
  initialSelectors: Selectors;
  path: string;
};

type UpdateOptions = {
  steps: Step[];
};

const loadSelectors = async (path: string): Promise<Selectors> => {
  const codeExists = await pathExists(path);
  if (!codeExists) return {};

  const selectors = await readJson(path);
  return selectors;
};

export class SelectorFileUpdater {
  public static async create(path: string): Promise<SelectorFileUpdater> {
    const initialSelectors = await loadSelectors(path);
    return new SelectorFileUpdater({ path, initialSelectors });
  }

  private _initialSelectors: Selectors;
  private _steps: Step[] = [];
  private _path: string;

  protected constructor(options: ConstructorOptions) {
    this._initialSelectors = options.initialSelectors;
    this._path = options.path;
  }

  public async discard(): Promise<void> {
    if (process.env.QAW_CREATE === 'true') {
      debug('discard selectors');
      await remove(this._path);
    } else {
      debug('revert selectors');
      await outputJson(this._path, this._initialSelectors, { spaces: ' ' });
    }
  }

  public selectors(): Selectors {
    return {
      ...this._initialSelectors,
      // merge the new selectors with the initial selectors
      // they should not conflict, since we start the new steps at later indices
      ...buildSelectors(this._steps),
    };
  }

  public async update(options: UpdateOptions): Promise<void> {
    debug('update selectors');
    this._steps = options.steps;

    const updatedSelectors = this.selectors();
    Registry.instance().setSelectors(updatedSelectors);

    await outputJson(this._path, updatedSelectors, { spaces: ' ' });
  }
}
