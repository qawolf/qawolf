import { Browser } from "./Browser";
import { Connection } from "./io/Connection";
import { Server } from "./io/Server";
import { Workflow } from "./types";

type Callbacks = {
  onStepBegin?: Array<() => void>;
};

type ConstructorArgs = {
  callbacks?: Callbacks;
  server: Server;
};

export class Runner {
  public _browser: Browser;
  private _callbacks: Callbacks;
  private _server: Server;

  constructor({ callbacks, server }: ConstructorArgs) {
    this._browser = new Browser();
    this._callbacks = callbacks || {};
    this._server = server;
  }

  // XXX: Multiple window support
  // Look for additional windows when step calls for them
  // and create another Connection.

  async runCallbacks(callbacks?: Array<() => void>): Promise<void> {
    if (!callbacks) return;

    const callbackPromises = callbacks.map(callback => {
      return callback();
    });

    await Promise.all(callbackPromises);
  }

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
      await this.runCallbacks(this._callbacks.onStepBegin);
    }

    connection.close();
  }

  async close() {
    await this._browser.close();
  }
}
