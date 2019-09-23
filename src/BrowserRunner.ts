import { Browser } from "./Browser";
import { Connection } from "./io/Connection";
import { Server } from "./io/Server";
import { Callbacks, Runner } from "./Runner";
import { BrowserAction, Workflow } from "./types";

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
  private _server: Server;

  constructor({ callbacks, server }: ConstructorArgs) {
    super(callbacks);

    this._browser = new Browser();
    this._server = server;
  }

  protected async beforeWorkflow(workflow: Workflow): Promise<void> {
    await this._browser.launch();
    await this._browser._browser!.url(workflow.href);

    this._connection = new Connection({
      browser: this._browser,
      server: this._server
    });
    await this._connection.connect();

    await super.beforeWorkflow(workflow);
  }

  protected async runStep(step: BrowserAction): Promise<void> {
    if (!this._connection) {
      throw "Not Connected";
    }
    await this._connection.run(step);
  }

  protected async afterWorkflow(workflow: Workflow): Promise<void> {
    await super.afterWorkflow(workflow);

    if (this._connection) {
      this._connection.close();
    }

    await this._browser.close();
  }
}
