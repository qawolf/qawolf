import { BrowserContext, launch } from "@qawolf/browser";
import { CodeCreator } from "@qawolf/create-code";
import { repl } from "@qawolf/repl";
import { prompt } from "inquirer";
import { bold } from "kleur";
import { join, relative } from "path";
import { Url } from "url";

type CreateOptions = {
  codePath?: string;
  debug?: boolean;
  device?: string;
  isTest?: boolean;
  name: string;
  path?: string;
  selectorPath?: string;
  url: Url;
};

type ConstructOptions = {
  context: BrowserContext;
  codePath: string;
  codeCreator: CodeCreator;
  isTest: boolean;
};

export class CreateCodeCLI {
  private _codePath: string;
  private _codeCreator: CodeCreator;
  private _context: BrowserContext;
  private _isTest: boolean;

  protected constructor(options: ConstructOptions) {
    this._codePath = options.codePath;
    this._codeCreator = options.codeCreator;
    this._context = options.context;
    this._isTest = options.isTest;
  }

  static async start(options: CreateOptions) {
    try {
      const contextPromise = launch({
        device: options.device,
        shouldRecordEvents: true,
        timeout: 0,
        url: options.url.href
      });

      const rootPath = options.path || `${process.cwd()}/.qawolf`;

      let codePath = options.codePath;
      if (!codePath) {
        codePath = options.isTest
          ? join(rootPath, "tests", `${options.name}.test.js`)
          : join(rootPath, "scripts", `${options.name}.js`);
      }

      const selectorPath =
        options.selectorPath ||
        join(rootPath, "selectors", `${options.name}.json`);

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

      const command = new CreateCodeCLI({
        codePath,
        codeCreator,
        context,
        isTest: !!options.isTest
      });
      await command.prompt();
    } catch (e) {
      if (e.message === "Cannot find selector file to update") {
        logNoSelectors();
      } else {
        throw e;
      }

      process.exit(1);
    }
  }

  protected async prompt() {
    const { choice } = await prompt<{ choice: string }>([
      {
        choices: ["💾  Save and Exit", "🖥️  Open REPL", "🗑️  Discard and Exit"],
        message: `Edit your ${this._isTest ? "test" : "script"} at: ${relative(
          process.cwd(),
          this._codePath
        )}`,
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

const logNoSelectors = () => {
  console.log(bold().red("Cannot find selectors to update"));
  console.log(
    bold().blue("Specify them with:"),
    "npx qawolf create --selectors /path/to/selectors.json"
  );
};
