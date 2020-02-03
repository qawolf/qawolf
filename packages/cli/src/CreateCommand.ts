import { BrowserContext, launch } from "@qawolf/browser";
import { buildCode, stepToSelector } from "@qawolf/build-code";
import { buildWorkflow } from "@qawolf/build-workflow";
import { logger } from "@qawolf/logger";
import { repl } from "@qawolf/repl";
import { outputFile, outputJson } from "fs-extra";
import { green } from "kleur";
import { Url } from "url";
import { prompt } from "inquirer";

type CreateOptions = {
  debug?: boolean;
  device?: string;
  name: string;
  path?: string;
  test?: boolean;
  url: Url;
};

export class CreateCommand {
  private options: CreateOptions;
  private context: BrowserContext;
  private fileName: string;
  private filePath: string;
  private rootPath: string;

  protected constructor(context: BrowserContext, options: CreateOptions) {
    this.context = context;
    this.options = options;

    const { name, path, test } = options;
    this.rootPath = path || `${process.cwd()}/.qawolf`;
    this.fileName = test ? `${name}.test.js` : `${name}.js`;
    this.filePath = test
      ? `${this.rootPath}/tests/${this.fileName}`
      : `${this.rootPath}/scripts/${this.fileName}`;
  }

  static async create(options: CreateOptions) {
    const context = await launch({
      device: options.device,
      recordEvents: true,
      timeout: 0,
      url: options.url.href
    });

    const command = new CreateCommand(context, options);
    await command.prompt();
  }

  protected async prompt() {
    const { choice } = await prompt<{ choice: string }>([
      {
        choices: ["💾 Save and Exit", "🖥️ Open REPL", "🗑️ Discard and Exit"],
        message: this.fileName,
        name: "choice",
        type: "list"
      }
    ]);

    if (choice.includes("REPL")) {
      await repl();
      await this.prompt();
      return;
    }

    await this.context.close();

    if (choice.includes("Save")) {
      await this.save();
    }

    process.exit(0);
  }

  protected async save() {
    const events = await this.context.qawolf.events();

    if (this.options.debug) {
      await this.saveJson("events", events);
    }

    const workflow = buildWorkflow({
      device: this.options.device,
      events,
      name: this.options.name,
      url: this.options.url.href!
    });

    if (this.options.debug) {
      await this.saveJson("workflows", workflow);
    }

    await this.saveJson(
      "selectors",
      workflow.steps.map((step, index) => ({
        // inline index so it is easy to correlate with the test
        index,
        ...stepToSelector(step)
      }))
    );

    await outputFile(
      this.filePath,
      buildCode({ test: this.options.test, workflow }),
      "utf8"
    );

    console.log(green("saved:"), `${this.filePath}`);
  }

  protected async saveJson(type: string, data: any) {
    const path = `${this.rootPath}/${type}/${this.options.name}.json`;
    logger.verbose(`save ${path}`);
    return outputJson(path, data, { spaces: " " });
  }
}
