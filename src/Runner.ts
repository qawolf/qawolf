import { Browser } from "./Browser";
import { Connection } from "./io/Connection";
import { Server } from "./io/Server";
import { Workflow } from "./types";

type Callback = (browser: Browser) => void;

type Callbacks = {
  onStepBegin?: Callback[];
  onWorkflowEnd?: Callback[];
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

  async runCallbacks(callbacks?: Callback[]): Promise<void> {
    if (!callbacks || !callbacks.length) return;

    const callbackPromises = callbacks.map(callback => {
      return callback(this._browser);
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
      await this.runCallbacks(this._callbacks.onStepBegin);
      await connection.run(step);
    }

    await this.runCallbacks(this._callbacks.onWorkflowEnd);

    connection.close();
  }

  async close() {
    await this._browser.close();
  }
}
