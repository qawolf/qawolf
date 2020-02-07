import { buildStepsCode, BuildStepsOptions } from "@qawolf/build-code";
import { Step } from "@qawolf/types";
import { PATCH_HANDLE } from "./patchCode";
// import { buildStepsCode, BuildStepsOptions } from "../build";
// import { canPatch, PATCH_HANDLE } from "./patchCode";
// import { relative } from "path";

type PatchOptions = {
  removeHandle?: boolean;
  steps: Step[];
};

// TODO this is the ode syncer?

export class CodeFile {
  private _codeFile: CodeFile;
  private _commitedStepIndex: number = 0;
  private _isTest: boolean;
  private _lock: boolean;

  public static async loadOrCreate(path: string) {
    return new CodeFile();
  }

  public relativePath() {
    // return relative(process.cwd(), this._path)
    return "";
  }

  public name() {}

  async patch(options: PatchOptions) {
    if (this._lock) return;

    // choose new (non-committed) steps
    const steps = options.steps.slice(this._commitedStepIndex);
    if (!steps.length) return;

    let patch = buildStepsCodePatch({
      isTest: this._isTest,
      steps
    });

    // TODO load code....

    if (options.removeHandle) {
      // TODO
    }

    this._commitedStepIndex += steps.length;
    this._lock = false;
  }

  //   async init() {
  //     // const codeExists = await pathExists(this._options.codePath);
  //     // if (codeExists) {
  //     //   this.load()
  //     // }
  //   }

  //   async load() {
  //     // TODO....
  //     // const code = await readFile(this._options.codePath, "utf8");
  //   }

  //   async createInitialCode() {
  //     // const initialCode = buildInitialCode({
  //     //   ...this._options,
  //     //   createCodeSymbol: CREATE_CODE_SYMBOL
  //     // });
  //     // await outputFile(this._options.path, initialCode, "utf8");
  //   }

  //   discard() {
  //     // if (this._preexistingCode) {
  //     //   console.log(yellow("reverted:"), this._options.codePath);
  //     //   await outputFile(this._options.codePath, this._preexistingCode, "utf8");
  //     // } else {
  //     //   await remove(this._options.codePath);
  //     // }
  //   }
  // }
}

export const buildStepsCodePatch = (options: BuildStepsOptions) => {
  let patch = buildStepsCode(options);

  // include the patch symbol so we can replace it later
  patch += PATCH_HANDLE;

  return patch;
};
