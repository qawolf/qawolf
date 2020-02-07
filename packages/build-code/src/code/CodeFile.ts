// import { buildStepsCode, BuildStepsOptions } from "../build";
// import { canPatch, PATCH_HANDLE } from "./patchCode";
// import { relative } from "path";

export class CodeFile {
  public static async loadOrCreate(path: string) {
    return new CodeFile();
  }

  async patch({ removeHandle }: { removeHandle?: boolean } = {}) {
    // TODO this should be responsible for getting current patch from builder
    // and locking/etc
    // const patch = this._patchBuilder.buildPatch(this._isTest);
    // if (!patch) return;
  }

  public relativePath() {
    // return relative(process.cwd(), this._path)
    return "";
  }

  public name() {}
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
