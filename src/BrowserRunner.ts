import { Browser } from "./Browser";
import { createRunFromJob } from "./callbacks/cli";
import { Connection } from "./io/Connection";
import { Server } from "./io/Server";
import { Callbacks, Runner } from "./Runner";
import { BrowserStep, Job, Run } from "./types";

type ConstructorArgs = {
  callbacks?: Callbacks;
  server: Server;
};

// XXX: Multiple window support
// Look for additional windows when step calls for them
// and create another Connection.

export class BrowserRunner extends Runner {
  public _browser: Browser;
  private _connection: Connection | null = null;
  private _run: Run | null = null;
  private _server: Server;

  constructor({ callbacks, server }: ConstructorArgs) {
    super(callbacks);

    this._browser = new Browser();
    this._server = server;
  }

  public async close(): Promise<void> {
    if (this._connection) {
      this._connection.close();
    }

    await this._browser.close();
  }

  protected async beforeRun(job: Job): Promise<void> {
    this._run = createRunFromJob(job);

    await this._browser.launch();
    await this._browser._browser!.url(job.href);

    this._connection = new Connection({
      browser: this._browser,
      server: this._server
    });
    await this._connection.connect();

    await super.beforeRun(job);
  }

  protected async runStep(step: BrowserStep): Promise<void> {
    if (!this._connection) {
      throw "Not Connected";
    }
    await this._connection.run(step);
  }
}
