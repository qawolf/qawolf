import { stepToSelector } from "@qawolf/build-code";
import { Selector, Step } from "@qawolf/types";
import { pathExists, readJson, outputJson, remove } from "fs-extra";
import { concat } from "lodash";

type ConstructorOptions = {
  path: string;
};

type PatchOptions = {
  steps: Step[];
};

export class SelectorFile {
  private _path: string;

  // public for tests
  public _preexistingSelectors: Selector[];
  private _newSelectors: Selector[] = [];

  private _lock: boolean;

  constructor(options: ConstructorOptions) {
    this._path = options.path;
  }

  protected async _write() {
    await outputJson(this._path, this.selectors(), { spaces: " " });
  }

  public static async loadOrCreate(options: ConstructorOptions) {
    const file = new SelectorFile(options);
    file._preexistingSelectors = await loadSelectors(options.path);

    if (!file._preexistingSelectors) {
      await file._write();
    }

    return file;
  }

  public async discard() {
    if (this._preexistingSelectors) {
      await outputJson(this._path, this._preexistingSelectors, {
        spaces: " "
      });
    } else {
      await remove(this._path);
    }
  }

  public hasPreexisting() {
    return !!this._preexistingSelectors;
  }

  public async patch(options: PatchOptions) {
    if (this._lock || options.steps.length <= this._newSelectors.length) {
      return;
    }

    this._lock = true;

    // we do not support editing of the selectors file
    // so we can replace the new selectors
    this._newSelectors = options.steps.map(step => ({
      ...stepToSelector(step),
      // inline index so it is easy to correlate with the test
      index: step.index + (this._preexistingSelectors || []).length
    }));

    await this._write();

    this._lock = false;
  }

  public selectors(): Selector[] {
    return concat(this._preexistingSelectors || [], this._newSelectors);
  }
}

export const loadSelectors = async (path: string) => {
  const codeExists = await pathExists(path);
  if (!codeExists) return;

  const file = await readJson(path);
  return file;
};
