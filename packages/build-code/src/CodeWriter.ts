import { ElementEvent } from "@qawolf/types";
import { pathExists, readFile, outputFile, outputJson } from "fs-extra";
import { green } from "kleur";
import { buildInitialCode, InitialCodeOptions } from "./buildInitialCode";
import { CREATE_CODE_SYMBOL, CodeUpdater } from "./CodeUpdater";
import { join, dirname } from "path";
import { stepToSelector } from "./stepToSelector";

export type CodeWriterOptions = Omit<InitialCodeOptions, "createCodeSymbol"> & {
  codePath: string;
};

export class CodeWriter {
  private _options: CodeWriterOptions;
  private _pollingIntervalId?: NodeJS.Timeout;
  private _updater: CodeUpdater;
  private _updating: boolean = false;

  protected constructor(options: CodeWriterOptions) {
    this._options = options;
    this._updater = new CodeUpdater(options);
  }

  public static async start(options: CodeWriterOptions) {
    const writer = new CodeWriter(options);
    await writer.createInitialCode();
    writer.startPolling();
    return writer;
  }

  protected async createInitialCode() {
    const codeExists = await pathExists(this._options.codePath);
    if (codeExists) return;

    const initialCode = buildInitialCode({
      ...this._options,
      createCodeSymbol: CREATE_CODE_SYMBOL
    });
    await outputFile(this._options.codePath, initialCode, "utf8");
  }

  protected dispose() {
    if (!this._pollingIntervalId) return;

    clearInterval(this._pollingIntervalId);
    this._pollingIntervalId = undefined;
  }

  protected startPolling() {
    this._pollingIntervalId = setInterval(async () => {
      await this.updateCode();
    }, 100);
  }

  protected async updateCode() {
    if (this._updating || !this._updater.numPendingSteps) return;

    const code = await readFile(this._options.codePath, "utf8");
    if (!CodeUpdater.hasCreateSymbol(code)) {
      console.log("no create symbol :(");
      // TODO log error debounced
      return;
    }

    this._updating = true;
    const updatedCode = this._updater.updateCode(code);
    await outputFile(this._options.codePath, updatedCode, "utf8");

    // TODO cleanup
    const selectorsPath = join(
      dirname(this._options.codePath),
      "../selectors",
      `${this._options.name}.json`
    );
    await outputJson(
      selectorsPath,
      this._updater._steps.map((step, index) => ({
        // inline index so it is easy to correlate with the test
        index,
        ...stepToSelector(step)
      })),
      { spaces: " " }
    );

    this._updating = false;
  }

  public async discard() {
    this.dispose();
    // TODO restore to original, or delete if there was no original
  }

  public prepare(event: ElementEvent) {
    this._updater.prepareSteps([event]);
  }

  // TODO run this on a loop
  public async save() {
    this.dispose();

    // TODO prepare w/ final options
    // TODO...
    // if (this.options.debug) {
    //   await this.saveJson("events", events);
    //   await this.saveJson("workflows", workflow);
    // }
    // const workflow = buildWorkflow({
    //   device: this.options.device,
    //   events,
    //   name: this.options.name,
    //   url: this.options.url.href!
    // });
    // TODO....

    console.log(green("saved:"), `${this._options.codePath}`);
  }
}
