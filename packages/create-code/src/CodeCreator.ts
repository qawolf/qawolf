import { StepBuilder } from "@qawolf/build-workflow";
import { ElementEvent } from "@qawolf/types";
import { bold } from "kleur";
import { writeJson } from "fs-extra";
import { throttle } from "lodash";
import { dirname, join } from "path";
import { CodeFile } from "./CodeFile";
import { PATCH_HANDLE } from "./patchCode";
import { SelectorFile } from "./SelectorFile";

type StartOptions = {
  codePath: string;
  device?: string;
  isTest?: boolean;
  name: string;
  selectorPath: string;
  url: string;
};

type ConstructorOptions = StartOptions & {
  codeFile: CodeFile;
  selectorFile: SelectorFile;
};

export class CodeCreator {
  private _codeFile: CodeFile;
  private _pollingIntervalId?: NodeJS.Timeout;
  private _selectorFile: SelectorFile;
  private _stepBuilder: StepBuilder;
  private _options: StartOptions;

  protected constructor({
    codeFile,
    selectorFile,
    ...options
  }: ConstructorOptions) {
    this._options = options;

    this._codeFile = codeFile;
    this._selectorFile = selectorFile;

    this._stepBuilder = new StepBuilder({
      startIndex: this._selectorFile.selectors().length
    });
  }

  public static async start(options: StartOptions) {
    const codeFile = await CodeFile.loadOrCreate({
      ...options,
      path: options.codePath
    });

    const selectorFile = await SelectorFile.loadOrCreate({
      path: options.selectorPath
    });

    if (codeFile.hasPreexisting() && !selectorFile.hasPreexisting()) {
      await selectorFile.discard();
      throw new Error("Cannot find selector file to update");
    }

    return new CodeCreator({ ...options, codeFile, selectorFile });
  }

  private async _saveDebug() {
    await writeJson(
      join(dirname(this._options.codePath), `${this._options.name}_debug.json`),
      {
        events: this._stepBuilder.events(),
        steps: this._stepBuilder.steps()
      }
    );
  }

  private async _patchFiles(removeHandle: boolean = false) {
    const steps = this._stepBuilder.steps();
    await Promise.all([
      this._codeFile.patch({ removeHandle, steps }),
      this._selectorFile.patch({ steps })
    ]);
  }

  public async discard() {
    await Promise.all([this._codeFile.discard(), this._selectorFile.discard()]);
  }

  public pushEvent(event: ElementEvent) {
    this._stepBuilder.pushEvent(event);
  }

  public async save({ debug }: { debug?: boolean } = {}) {
    this._stepBuilder.finalize();
    await this._patchFiles(true);
    logSaveSuccess(this._codeFile);

    if (debug) {
      await this._saveDebug();
    }
  }

  public startPolling() {
    this._pollingIntervalId = setInterval(async () => {
      try {
        await this._patchFiles();
      } catch (e) {
        if (e.message.includes("Cannot patch without handle")) {
          logNoHandle();
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

const logNoHandle = throttle(
  () => {
    console.log("\n");
    console.warn(
      bold().red("Cannot update code without this line:"),
      PATCH_HANDLE
    );
  },
  10000,
  { leading: true }
);

const logSaveSuccess = (codeFile: CodeFile) => {
  const command = codeFile.isTest()
    ? `npx qawolf test ${codeFile.name()}`
    : `node ${codeFile.relativePath()}`;

  console.log(
    bold().blue(`✨  Saved your ${codeFile.isTest() ? "test" : "script"} at:`),
    codeFile.relativePath()
  );
  console.log(bold().blue("🐺  Run it with:"), command);
};
