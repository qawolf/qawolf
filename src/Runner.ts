import { Browser } from "./Browser";
import { Server } from "./io/Server";
import { Workflow } from "./types";
import { connect } from "tls";

export class Runner {
  private _browser: Browser;
  private _server: Server;

  constructor(server: Server) {
    this._browser = new Browser();
    this._server = server;
  }

  async run(workflow: Workflow) {
    await this._browser.launch();
    await this._browser._browser!.url(workflow.href);

    const connection = await this._server.injectClient(this._browser);
    await connection.method("run", workflow.steps);
  }
}
