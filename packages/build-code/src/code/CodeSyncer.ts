import { bold } from "kleur";
import { throttle } from "lodash";
import { canPatch, PATCH_SYMBOL } from "./patchCode";

export class CodeSyncer {
  // TODO figure out when to
  public warnCannotUpdate = throttle(
    () => {
      console.log(
        "\n",
        bold().red("Cannot update code without this line:"),
        PATCH_SYMBOL
      );
    },
    10000,
    { leading: true }
  );

  private _logSaveSuccess() {
    const relativeCodePath = relative(process.cwd(), this._options.codePath);
    const codeType = this._options.isTest ? "test" : "script";
    const command = this._options.isTest
      ? `npx qawolf test ${this._options.name}`
      : `node ${relativeCodePath}`;

    console.log(bold().blue(`✨  Created your ${codeType}`));
    console.log(bold().blue("🐺  Run it with:"), command);
  }

  public async patchCode() {
    const code = await this._codeFile.load();
    if (!canPatch(code)) {
      this.warnCannotUpdate();
      return false;
    }

    const patchedCode = patchCode();
    await this._codeFile.update(patchedCode);

    // TODO selectors...
  }

  public async save() {
    // TODO throw error if this is called and cannot patch?
    // Do not allow selecting save, until it is saveable?
    await this.patchCode({ interimSteps: true, removeSymbol: true });

    // TODO selectors

    this._logSaveSuccess();
  }

  public async update() {
    // only load the code when it makes sense to
    if (!this._tracker.getPendingSteps() < 1) return;

    await this.patchCode();
  }

  public startUpdatePolling() {
    this._pollingIntervalId = setInterval(async () => {
      await this._updateCode();
    }, 100);
  }

  public stopUpdatePolling() {
    if (!this._pollingIntervalId) return;

    clearInterval(this._pollingIntervalId);
    this._pollingIntervalId = undefined;
  }
}

// stepStartIndex: this._preexistingSelectors
//     ? this._preexistingSelectors.length
//     : 0

//     if (this._options.debug) {
//       await this._saveDebugFiles(workflow);
//     }
