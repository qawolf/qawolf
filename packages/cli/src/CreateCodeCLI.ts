import { BrowserContext, launch } from "@qawolf/browser";
import { CodeCreator } from "@qawolf/create-code";
import { repl } from "@qawolf/repl";
import { prompt } from "inquirer";
import { basename, join } from "path";
import { Url } from "url";

type CreateOptions = {
  debug?: boolean;
  device?: string;
  isTest?: boolean;
  name: string;
  path?: string;
  url: Url;
};

type ConstructOptions = {
  context: BrowserContext;
  codePath: string;
  codeCreator: CodeCreator;
};

export class CreateCodeCLI {
  private _codePath: string;
  private _codeCreator: CodeCreator;
  private _context: BrowserContext;

  protected constructor(options: ConstructOptions) {
    this._codePath = options.codePath;
    this._codeCreator = options.codeCreator;
    this._context = options.context;
  }

  static async start(options: CreateOptions) {
    const contextPromise = launch({
      device: options.device,
      shouldRecordEvents: true,
      timeout: 0,
      url: options.url.href
    });

    const rootPath = options.path || `${process.cwd()}/.qawolf`;

    const codePath = options.isTest
      ? join(rootPath, "tests", `${options.name}.test.js`)
      : join(rootPath, "scripts", `${options.name}.js`);

    const selectorPath = join(rootPath, "selectors", `${options.name}.json`);

    const codeCreator = await CodeCreator.start({
      codePath,
      device: options.device,
      isTest: options.isTest,
      name: options.name,
      selectorPath,
      url: options.url.href!
    });

    const context = await contextPromise;

    context.qawolf.on("recorded_event", event => {
      codeCreator.pushEvent(event);
    });

    codeCreator.startPolling();

    const command = new CreateCodeCLI({ codePath, codeCreator, context });
    await command.prompt();
  }

  protected async prompt() {
    const { choice } = await prompt<{ choice: string }>([
      {
        choices: ["💾  Save and Exit", "🖥️  Open REPL", "🗑️  Discard and Exit"],
        message: basename(this._codePath),
        name: "choice",
        type: "list"
      }
    ]);

    if (choice.includes("REPL")) {
      await repl();
      await this.prompt();
      return;
    }

    await this._context.close();

    if (choice.includes("Save")) {
      await this._codeCreator.save();
    } else {
      await this._codeCreator.discard();
    }

    process.exit(0);
  }
}
