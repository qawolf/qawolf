import { StepBuilder } from "@qawolf/build-code";
import { ElementEvent } from "@qawolf/types";
import { bold } from "kleur";
import { throttle } from "lodash";
import { CodeFile } from "./CodeFile";
import { PATCH_HANDLE } from "./patchCode";
import { SelectorFile } from "./SelectorFile";

type ConstructorOptions = {
  codeFile: CodeFile;
  isTest?: boolean;
  selectorFile: SelectorFile;
};

type StartOptions = {
  codePath: string;
  device?: string;
  isTest?: boolean;
  name: string;
  selectorPath: string;
  url: string;
};

export class CodeCreator {
  private _codeFile: CodeFile;
  private _isTest: boolean;
  private _pollingIntervalId?: NodeJS.Timeout;
  private _selectorFile: SelectorFile;
  private _stepBuilder: StepBuilder;

  protected constructor({
    codeFile,
    isTest,
    selectorFile
  }: ConstructorOptions) {
    this._codeFile = codeFile;
    this._isTest = !!isTest;
    this._selectorFile = selectorFile;

    this._stepBuilder = new StepBuilder({
      startIndex: this._selectorFile.selectors().length
    });
  }

  public static async start(options: StartOptions) {
    const codeFile = await CodeFile.loadOrCreate(options.codePath);
    const selectorFile = await SelectorFile.loadOrCreate(options.selectorPath);
    return new CodeCreator({ codeFile, isTest: options.isTest, selectorFile });
  }

  private _logSaveSuccess() {
    const command = this._isTest
      ? `npx qawolf test ${this._codeFile.name()}`
      : `node ${this._codeFile.relativePath()}`;

    console.log(
      bold().blue(`✨  Created your ${this._isTest ? "test" : "script"}`)
    );
    console.log(bold().blue("🐺  Run it with:"), command);
  }

  private _warnCannotUpdate = throttle(
    () => {
      console.warn(
        "\n",
        bold().red("Cannot update code without this line:"),
        PATCH_HANDLE
      );
    },
    10000,
    { leading: true }
  );

  public async discard() {}

  private async patchFiles({ removeHandle }: { removeHandle?: boolean } = {}) {
    await Promise.all([
      this._codeFile.patch({ removeHandle, steps: this._stepBuilder.steps() }),
      this._selectorFile.patch()
    ]);
  }

  public pushEvent(event: ElementEvent) {
    this._stepBuilder.pushEvent(event);
  }

  public async save() {
    this._stepBuilder.finalize();
    await this.patchFiles({ removeHandle: true });
    this._logSaveSuccess();
  }

  public startPolling() {
    this._pollingIntervalId = setInterval(async () => {
      try {
        await this.patchFiles();
      } catch (e) {
        // TODO
        if (e === "") {
          this._warnCannotUpdate();
        } else {
          throw e;
        }
      }
    }, 100);
  }

  public stopPolling() {
    if (!this._pollingIntervalId) return;

    clearInterval(this._pollingIntervalId);
    this._pollingIntervalId = undefined;
  }
}
