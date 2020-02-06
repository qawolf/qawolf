import { ElementEvent } from "@qawolf/types";
import { pathExists, readFile, outputFile, outputJson } from "fs-extra";
import { bold, green } from "kleur";
import { debounce } from "lodash";
import { join, dirname } from "path";
import { buildInitialCode, InitialCodeOptions } from "./buildInitialCode";
import { CREATE_CODE_SYMBOL, CodeUpdater } from "./CodeUpdater";
import { stepToSelector } from "./stepToSelector";

export type CodeWriterOptions = Omit<InitialCodeOptions, "createCodeSymbol"> & {
  codePath: string;
};

export class CodeWriter {
  private _options: CodeWriterOptions;
  private _pollingIntervalId?: NodeJS.Timeout;
  private _selectorsPath: string;
  // public for tests
  public _updater: CodeUpdater;
  private _updating: boolean = false;

  protected constructor(options: CodeWriterOptions) {
    this._options = options;

    // XXX support updating selectors that are moved
    this._selectorsPath = join(
      dirname(this._options.codePath),
      "../selectors",
      `${this._options.name}.json`
    );

    this._updater = new CodeUpdater(options);
  }

  public static async start(options: CodeWriterOptions) {
    const writer = new CodeWriter(options);
    await writer._createInitialCode();
    return writer;
  }

  protected async _createInitialCode() {
    const codeExists = await pathExists(this._options.codePath);
    if (codeExists) return;

    const initialCode = buildInitialCode({
      ...this._options,
      createCodeSymbol: CREATE_CODE_SYMBOL
    });
    await outputFile(this._options.codePath, initialCode, "utf8");
  }

  // public for testing
  public async _loadUpdatableCode() {
    const code = await readFile(this._options.codePath, "utf8");

    if (!CodeUpdater.hasCreateSymbol(code)) {
      this._logMissingCreateSymbol();
      return;
    }

    return code;
  }

  protected _logMissingCreateSymbol = debounce(
    () => {
      console.log(
        bold().red("Cannot update code without this line:"),
        CREATE_CODE_SYMBOL
      );
    },
    10000,
    { leading: true }
  );

  // public for testing
  public async _updateCode() {
    if (this._updating || this._updater.getNumPendingSteps() < 1) return;

    const code = await this._loadUpdatableCode();
    if (!code) return;

    this._updating = true;

    const updatedCode = this._updater.updateCode(code);
    await Promise.all([
      outputFile(this._options.codePath, updatedCode, "utf8"),
      this._updateSelectors()
    ]);

    this._updating = false;
  }

  // public for testing
  public async _updateSelectors() {
    const selectors = this._updater._steps.map((step, index) => ({
      // inline index so it is easy to correlate with the test
      index,
      ...stepToSelector(step)
    }));

    await outputJson(this._selectorsPath, selectors, { spaces: " " });
  }

  public async discard() {
    this.stopUpdatePolling();

    // TODO restore to original, or delete if there was no original
  }

  public prepare(events: ElementEvent[]) {
    this._updater.prepareSteps(events);
  }

  public async save() {
    this.stopUpdatePolling();
    // TODO prepare w/ final options

    // TODO...
    // if (this.options.debug) {
    //   await this.saveJson("events", events);
    //   await this.saveJson("workflows", workflow);
    // }

    console.log(green("saved:"), `${this._options.codePath}`);
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
