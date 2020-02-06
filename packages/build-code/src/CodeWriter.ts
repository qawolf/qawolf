import { ElementEvent, Workflow } from "@qawolf/types";
import { pathExists, readFile, outputFile, outputJson, remove } from "fs-extra";
import { bold, green, red } from "kleur";
import { debounce } from "lodash";
import { join, dirname } from "path";
import { buildInitialCode, InitialCodeOptions } from "./buildInitialCode";
import { CREATE_CODE_SYMBOL, CodeUpdater } from "./CodeUpdater";
import { stepToSelector } from "./stepToSelector";

export type CodeWriterOptions = Omit<InitialCodeOptions, "createCodeSymbol"> & {
  codePath: string;
  debug?: boolean;
};

export class CodeWriter {
  private _options: CodeWriterOptions;
  private _pollingIntervalId?: NodeJS.Timeout;
  // public for tests
  public _preexistingCode?: string;
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
    if (codeExists) {
      this._preexistingCode = await readFile(this._options.codePath, "utf8");
      return;
    }

    const initialCode = buildInitialCode({
      ...this._options,
      createCodeSymbol: CREATE_CODE_SYMBOL
    });
    await outputFile(this._options.codePath, initialCode, "utf8");
  }

  // public for tests
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

  protected async _saveDebugFiles(workflow: Workflow) {
    const rootPath = dirname(this._options.codePath);
    await outputJson(join(rootPath, "../events"), this._updater.getEvents(), {
      spaces: " "
    });

    await outputJson(join(rootPath, "../workflows"), workflow, {
      spaces: " "
    });
  }

  // public for tests
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

  // public for tests
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

    if (this._preexistingCode) {
      console.log(red("reverted:"), `${this._options.codePath}`);
      await outputFile(this._options.codePath, this._preexistingCode, "utf8");
    } else {
      console.log(red("removed:"), `${this._options.codePath}`);
      await remove(this._options.codePath);
    }
  }

  public prepare(newEvents: ElementEvent[]) {
    this._updater.prepareSteps({ newEvents, onlyFinalSteps: true });
  }

  public async save() {
    this.stopUpdatePolling();

    // since we are done recording, include not-finalized steps
    const workflow = this._updater.prepareSteps({ onlyFinalSteps: false });

    if (this._options.debug) {
      await this._saveDebugFiles(workflow);
    }

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
