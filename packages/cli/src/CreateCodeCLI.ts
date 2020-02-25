import { BrowserContext, launch } from "@qawolf/browser";
import { CodeCreator } from "@qawolf/create-code";
import { repl } from "@qawolf/repl";
import { prompt } from "inquirer";
import { bold } from "kleur";
import { join, relative } from "path";
import { ContextManager } from "@qawolf/browser/src/managers/ContextManager";

type CreateOptions = {
  codePath?: string;
  debug?: boolean;
  isTest?: boolean;
  name: string;
  path?: string;
  selectorPath?: string;
};

type ConstructOptions = {
  context: BrowserContext;
  codePath: string;
  codeCreator: CodeCreator;
  debug: boolean;
  isTest: boolean;
};

export class CreateCodeCLI {
  private _codePath: string;
  private _codeCreator: CodeCreator;
  private _context: BrowserContext;
  private _debug: boolean;
  private _isTest: boolean;

  protected constructor(options: ConstructOptions) {
    this._codePath = options.codePath;
    this._codeCreator = options.codeCreator;
    this._context = options.context;
    this._debug = options.debug;
    this._isTest = options.isTest;
  }

  static async start(options: CreateOptions) {
    try {
      const launchPromise = launch({
        // TODO
        // device: options.device,
        timeout: 0
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
        // TODO
        // device: options.device,
        isTest: options.isTest,
        name: options.name,
        selectorPath,
        // TODO
        url: "google.com"
      });

      const { context } = await launchPromise;

      const manager = new ContextManager(context);

      manager.on("recorded_event", event => codeCreator.pushEvent(event));

      codeCreator.startPolling();

      const command = new CreateCodeCLI({
        codePath,
        codeCreator,
        context: manager.context(),
        debug: !!options.debug,
        isTest: !!options.isTest
      });
      await command._prompt();
    } catch (e) {
      if (e.message === "Cannot find selector file to update") {
        logNoSelectors();
      } else {
        throw e;
      }

      process.exit(1);
    }
  }

  protected async _prompt() {
    const { choice } = await prompt<{ choice: string }>([
      {
        choices: [
          "💾  Save and exit",
          "🖥️  Open REPL to run code",
          "🗑️  Discard and exit"
        ],
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
      await this._prompt();
      return;
    }

    await this._context.close();

    if (choice.includes("Save")) {
      await this._codeCreator.save({ debug: this._debug });
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
