import { stepToSelector } from "@qawolf/build-code";
import { Selector, Step } from "@qawolf/types";
import { concat } from "lodash";
import { pathExists, readJson, outputJson, remove } from "fs-extra";

type ConstructorOptions = {
  path: string;
};

type PatchOptions = {
  steps: Step[];
};

export class SelectorFile {
  private _path: string;

  private _preexistingSelectors: Selector[];
  private _newSelectors: Selector[] = [];

  private _lock: boolean;

  constructor(options: ConstructorOptions) {
    this._path = options.path;
  }

  public static async loadOrCreate(options: ConstructorOptions) {
    const file = new SelectorFile(options);
    file._preexistingSelectors = (await loadSelectors(options.path)) || [];
    return file;
  }

  public async discard() {
    if (this._preexistingSelectors.length) {
      await outputJson(this._path, this._preexistingSelectors, {
        spaces: " "
      });
    } else {
      await remove(this._path);
    }
  }

  public async patch(options: PatchOptions) {
    if (this._lock || options.steps.length <= this._newSelectors.length) {
      return;
    }

    this._lock = true;

    this._newSelectors = options.steps.map(step => ({
      ...stepToSelector(step),
      // inline index so it is easy to correlate with the test
      index: step.index + this._preexistingSelectors.length
    }));

    await outputJson(this._path, this.selectors(), { spaces: " " });

    this._lock = false;
  }

  public selectors(): Selector[] {
    return concat(this._preexistingSelectors, this._newSelectors);
  }
}

export const loadSelectors = async (path: string): Promise<Selector[]> => {
  const codeExists = await pathExists(path);
  if (!codeExists) return [];

  const file = await readJson(path);
  return file;
};
