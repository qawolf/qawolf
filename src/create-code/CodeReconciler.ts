import Debug from 'debug';
import { VirtualCode } from '../build-code/VirtualCode';
import { patchCode, PATCH_HANDLE } from './patchCode';

const debug = Debug('qawolf:CodeReconciler');

type ReconcileOptions = {
  actualCode: string;
  virtualCode: VirtualCode;
};

export class CodeReconciler {
  // the virtual representation of the current code
  _virtualCode: VirtualCode = new VirtualCode([]);

  _insertNewLines({ actualCode, virtualCode }: ReconcileOptions): string {
    const newLines = this._virtualCode.newLines(virtualCode);
    if (newLines.length < 1) return actualCode;

    const patch = newLines.map((line) => `${line}\n`).join('') + PATCH_HANDLE;
    debug(`insert new lines: ${patch}`);

    try {
      return patchCode({ code: actualCode, patch });
    } catch (e) {
      debug('skip new lines: cannot find patch handle');
      return actualCode;
    }
  }

  _updateLastLine({ actualCode, virtualCode }: ReconcileOptions): string {
    /**
     * Update the last expression if it changed.
     */
    const linePatch = this._virtualCode.buildPatch(virtualCode);
    if (!linePatch) return actualCode;

    // find the last occurrence of the original expression
    const indexToReplace = actualCode.lastIndexOf(linePatch.original);

    // we cannot find the original expression so return the unmodified code
    if (indexToReplace < 0) {
      debug(
        'skip last line update: cannot find original code to update "%j"',
        linePatch.original,
      );
      return actualCode;
    }

    debug('update last line');

    const updatedCode =
      actualCode.slice(0, indexToReplace) +
      actualCode
        .slice(indexToReplace)
        .replace(linePatch.original, linePatch.updated);

    return updatedCode;
  }

  public hasChanges(virtualCode: VirtualCode): boolean {
    const hasPatch = !!this._virtualCode.buildPatch(virtualCode);
    if (hasPatch) {
      debug('has patch for last line');
      return true;
    }

    const hasNewLines = this._virtualCode.newLines(virtualCode).length > 0;
    if (hasNewLines) {
      debug('has new lines');
      return true;
    }

    debug('no changes');
    return false;
  }

  public reconcile({ actualCode, virtualCode }: ReconcileOptions): string {
    let updatedCode = this._updateLastLine({ actualCode, virtualCode });

    updatedCode = this._insertNewLines({
      actualCode: updatedCode,
      virtualCode,
    });

    return updatedCode;
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
