import { BrowserContext, launch } from "@qawolf/browser";
import { CodeWriter } from "@qawolf/build-code";
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
  codeWriter: CodeWriter;
};

export class CreateCodeCLI {
  private _codePath: string;
  private _codeWriter: CodeWriter;
  private _context: BrowserContext;

  protected constructor(options: ConstructOptions) {
    this._codePath = options.codePath;
    this._codeWriter = options.codeWriter;
    this._context = options.context;
  }

  static async start(options: CreateOptions) {
    const context = await launch({
      device: options.device,
      shouldRecordEvents: true,
      timeout: 0,
      url: options.url.href
    });

    const rootPath = options.path || `${process.cwd()}/.qawolf`;

    const codePath = options.isTest
      ? `${rootPath}/tests/${options.name}.test.js`
      : `${rootPath}/scripts/${options.name}.js`;

    const codeWriter = await CodeWriter.start({
      codePath,
      device: options.device,
      isTest: options.isTest,
      name: options.name,
      url: options.url.href!
    });

    context.qawolf.on("recorded_event", event => {
      codeWriter.prepare([event]);
    });

    codeWriter.startUpdatePolling();

    const command = new CreateCodeCLI({ codePath, codeWriter, context });
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
      await this._codeWriter.save();
    } else {
      await this._codeWriter.discard();
    }

    process.exit(0);
  }
}
