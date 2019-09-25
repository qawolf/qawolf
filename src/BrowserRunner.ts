import { Pool } from "./browser/Pool";
import { Server } from "./browser/Server";
import { Callbacks, Runner } from "./Runner";
import { BrowserStep, Job } from "./types";

type ConstructorArgs = {
  callbacks?: Callbacks;
  server: Server;
};

export class BrowserRunner extends Runner {
  public _pool: Pool;
  private _server: Server;

  constructor({ callbacks, server }: ConstructorArgs) {
    super(callbacks);
    this._server = server;
  }

  public get browser() {
    return this._pool.browser;
  }

  public async close(): Promise<void> {
    await this._pool.close();
  }

  protected async beforeRun(job: Job): Promise<void> {
    this._pool = new Pool({ server: this._server, url: job.href });
    await this._pool.create();

    await super.beforeRun(job);
  }

  protected async runStep(step: BrowserStep): Promise<void> {
    const connection = await this._pool.getConnection(step.pageId);
    await connection.runStep(step);
  }
}
