import Debug from 'debug';
import { VirtualCode } from '../build-code/VirtualCode';
import { patchCode } from './patchCode';

const debug = Debug('qawolf:CodeReconciler');

type ReconcileOptions = {
  actualCode: string;
  virtualCode: VirtualCode;
};

export class CodeReconciler {
  // the virtual representation of the current code
  _virtualCode: VirtualCode = new VirtualCode([]);

  public hasChanges(virtualCode: VirtualCode): boolean {
    return !!this._virtualCode.buildPatch(virtualCode);
  }

  /**
   * @summary Compares the previous virtual code with the new virtual
   *   code, and then uses that diff to update the `actualCode` and
   *   return the modified actual code.
   */
  public reconcile({ actualCode, virtualCode }: ReconcileOptions): string {
    const linePatch = this._virtualCode.buildPatch(virtualCode);
    if (!linePatch) return actualCode;

    try {
      return patchCode({
        code: actualCode,
        patchLines: linePatch.newLines,
        replaceLines: linePatch.removedLines,
      });
    } catch (e) {
      debug('skip new lines: cannot find patch handle');
      return actualCode;
    }
  }

  public update(virtualCode: VirtualCode): void {
    if (this._virtualCode.lines().length > virtualCode.lines().length) {
      // Prevent updating our virtual code with one that has less expressions.
      // This could happen if a step is removed (ex. paste will remove the type).
      // This allows us to update the last expression when a new step arrives to replace the missing one.
      debug('skip virtual code update with less expressions');
      return;
    }

    this._virtualCode = virtualCode;
  }
}
