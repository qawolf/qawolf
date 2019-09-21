import { Browser } from "./Browser";
import { Server } from "./io/Server";
import { Workflow } from "./types";
import { Connection } from "./io/Connection";

export class Runner {
  private _browser: Browser;
  private _server: Server;

  constructor(server: Server) {
    this._browser = new Browser();
    this._server = server;
  }

  // TODO runner could have multiple connections if there are multiple pages
  // Look for additional pages when step calls for them

  async run(workflow: Workflow) {
    await this._browser.launch();
    await this._browser._browser!.url(workflow.href);

    const connection = await Connection.create(this._browser, this._server);

    for (let step of workflow.steps) {
      await connection.method("run", step);
    }
  }
}
