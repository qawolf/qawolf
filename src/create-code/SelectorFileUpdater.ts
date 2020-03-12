import { outputJson, remove, pathExists, readJson } from 'fs-extra';
import { ReplContext } from 'playwright-utils';
import { buildSelectors } from '../build-code/buildSelectors';
import { Selectors, Step } from '../types';

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

  private _lock: boolean;

  protected constructor(options: ConstructorOptions) {
    this._initialSelectors = options.initialSelectors;
    this._path = options.path;
  }

  public async discard(): Promise<void> {
    if (this._initialSelectors.length) {
      await outputJson(this._path, this._initialSelectors, { spaces: ' ' });
    } else {
      await remove(this._path);
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
    this._steps = options.steps;

    if (this._lock) return;
    this._lock = true;

    const updatedSelectors = this.selectors();
    ReplContext.set('selectors', updatedSelectors);
    await outputJson(this._path, updatedSelectors, { spaces: ' ' });

    this._lock = false;
  }
}
