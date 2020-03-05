import Debug from 'debug';
import { buildVirtualCode } from '../build-code/buildVirtualCode';
import { CodeReconciler } from './CodeReconciler';
import { Step } from '../types';

const debug = Debug('create-playwright:CodeUpdater');

export type CodeFileOptions = {
  path: string;
};

type UpdateOptions = {
  steps: Step[];
};

export abstract class CodeUpdater {
  private _locked = false;
  private _reconciler: CodeReconciler;

  protected constructor() {
    this._reconciler = new CodeReconciler();
  }

  protected locked(): boolean {
    return false;
  }

  protected abstract async loadCode(): Promise<string>;
  protected abstract async updateCode(code: string): Promise<void>;

  public async finalize(): Promise<void> {
    // TODO remove patch handle
    // lock updates
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
    const actualCode = await this.loadCode();

    const updatedCode = this._reconciler.reconcile({
      actualCode,
      virtualCode: updatedVirtualCode,
    });
    await this.updateCode(updatedCode);

    // store the updated virtual code
    this._reconciler.update(updatedVirtualCode);

    this._locked = false;
  }
}
