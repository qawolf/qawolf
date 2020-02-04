import { ElementEvent } from "@qawolf/types";
import { pathExists, readFile, outputFile } from "fs-extra";
import { green } from "kleur";
import { buildInitialCode, InitialCodeOptions } from "./buildInitialCode";
import { CREATE_CODE_SYMBOL, CodeUpdater } from "./CodeUpdater";

export type CodeWriterOptions = Omit<InitialCodeOptions, "createCodeSymbol"> & {
  codePath: string;
};

export class CodeWriter {
  private _options: CodeWriterOptions;
  private _updater: CodeUpdater;

  protected constructor(options: CodeWriterOptions) {
    this._options = options;
    this._updater = new CodeUpdater(options);
  }

  public static async start(options: CodeWriterOptions) {
    const writer = new CodeWriter(options);
    await writer.createInitialCode();
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

  protected async updateCode() {
    if (!this._updater.hasUpdates) return;

    const code = await readFile(this._options.codePath, "utf8");
    const updatedCode = this._updater.update(code);
    if (!updatedCode) return;

    await outputFile(this._options.codePath, updatedCode, "utf8");
  }

  public async discard() {
    // TODO restore to original, or delete if there was no original
  }

  public prepare(event: ElementEvent) {
    this._updater.prepare(event);
  }

  // TODO run this on a loop

  public async save() {
    // TODO remove final line
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
    // await this.saveJson(
    //   "selectors",
    //   workflow.steps.map((step, index) => ({
    //     // inline index so it is easy to correlate with the test
    //     index,
    //     ...stepToSelector(step)
    //   }))
    // );

    console.log(green("saved:"), `${this._options.codePath}`);
  }
}
