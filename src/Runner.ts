import { Browser } from "./Browser";
import { Connection } from "./io/Connection";
import { Server } from "./io/Server";
import { Workflow } from "./types";

export class Runner {
  public _browser: Browser;
  private _server: Server;

  constructor(server: Server) {
    this._browser = new Browser();
    this._server = server;
  }

  // XXX: Multiple window support
  // Look for additional windows when step calls for them
  // and create another Connection.

  async run(workflow: Workflow) {
    await this._browser.launch();
    await this._browser._browser!.url(workflow.href);

    const connection = new Connection({
      browser: this._browser,
      server: this._server
    });
    await connection.connect();

    for (let step of workflow.steps) {
      await connection.run(step);
    }

    connection.close();
  }

  async close() {
    await this._browser.close();
  }
}
