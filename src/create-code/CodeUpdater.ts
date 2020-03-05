import Debug from 'debug';
import { buildVirtualCode } from '../build-code/buildVirtualCode';
import { CodeReconciler } from './CodeReconciler';
import { getLineIncludes, removeLinesIncluding } from './format';
import { PATCH_HANDLE } from './patchCode';
import { Step } from '../types';

const debug = Debug('qawolf:CodeUpdater');

export type CodeFileOptions = {
  path: string;
};

type UpdateOptions = {
  steps: Step[];
};

export const CREATE_HANDLE = `await qawolf.create`;

export abstract class CodeUpdater {
  protected _locked = false;
  private _reconciler: CodeReconciler;

  protected constructor() {
    this._reconciler = new CodeReconciler();
  }

  protected abstract async _loadCode(): Promise<string>;
  protected abstract async _updateCode(code: string): Promise<void>;

  public async prepare(): Promise<void> {
    this._locked = true;
    const code = await this._loadCode();

    const createLine = getLineIncludes(code, CREATE_HANDLE);
    if (!createLine) {
      throw new Error(`Could not find "${CREATE_HANDLE}"`);
    }

    // trim to match indentation
    const updatedCode = code.replace(createLine.trim(), PATCH_HANDLE);

    await this._updateCode(updatedCode);

    this._locked = false;
  }

  public async finalize(): Promise<void> {
    this._locked = true;
    let code = await this._loadCode();
    code = removeLinesIncluding(code, PATCH_HANDLE);
    await this._updateCode(code);
  }

  public async update(options: UpdateOptions): Promise<void> {
    // do not conflict with an update in progress
    if (this._locked) {
      debug(`skip update: update in progress`);
      return;
    }

    // check the virtual code changed
    const updatedVirtualCode = buildVirtualCode(options.steps);
    if (!this._reconciler.hasChanges(updatedVirtualCode)) {
      debug(`skip update: no virtual changes`);
      return;
    }

    this._locked = true;

    // update the actual code
    const actualCode = await this._loadCode();

    const updatedCode = this._reconciler.reconcile({
      actualCode,
      virtualCode: updatedVirtualCode,
    });
    await this._updateCode(updatedCode);

    // store the updated virtual code
    this._reconciler.update(updatedVirtualCode);

    this._locked = false;
  }
}
