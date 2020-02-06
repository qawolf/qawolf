// virtualizable/mockable
export class CodeFile {
  // load or create initial
  // ----
  // save
  // ----
  // revert

  async init() {
    // const codeExists = await pathExists(this._options.codePath);
    // if (codeExists) {
    //   this.load()
    // }
  }

  async load() {
    // TODO....
    // const code = await readFile(this._options.codePath, "utf8");
  }

  async createInitialCode() {
    // const initialCode = buildInitialCode({
    //   ...this._options,
    //   createCodeSymbol: CREATE_CODE_SYMBOL
    // });
    // await outputFile(this._options.path, initialCode, "utf8");
  }

  discard() {
    // if (this._preexistingCode) {
    //   console.log(yellow("reverted:"), this._options.codePath);
    //   await outputFile(this._options.codePath, this._preexistingCode, "utf8");
    // } else {
    //   await remove(this._options.codePath);
    // }
  }
}
