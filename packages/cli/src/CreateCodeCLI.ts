import { BrowserContext, launch } from "@qawolf/browser";
import { CodeSyncer } from "@qawolf/build-code";
import { repl } from "@qawolf/repl";
import { prompt } from "inquirer";
import { basename } from "path";
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
  codeSyncer: CodeSyncer;
};

export class CreateCodeCLI {
  private _codePath: string;
  private _codeSyncer: CodeSyncer;
  private _context: BrowserContext;

  protected constructor(options: ConstructOptions) {
    this._codePath = options.codePath;
    this._codeSyncer = options.codeSyncer;
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
      ? `${rootPath}/tests/${options.name}.test.js`
      : `${rootPath}/scripts/${options.name}.js`;

    const codeSyncer = await CodeSyncer.start({
      codePath,
      device: options.device,
      isTest: options.isTest,
      name: options.name,
      url: options.url.href!
    });

    const context = await contextPromise;

    context.qawolf.on("recorded_event", event => {
      codeSyncer.pushEvent(event);
    });

    codeSyncer.startPolling();

    const command = new CreateCodeCLI({ codePath, codeSyncer, context });
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
      await this._codeSyncer.save();
    } else {
      await this._codeSyncer.discard();
    }

    process.exit(0);
  }
}
