import { Browser } from "./Browser";
import { createRunFromJob } from "./callbacks/cli";
import { Connection } from "./io/Connection";
import { Server } from "./io/Server";
import { Callbacks, Runner } from "./Runner";
import { BrowserStep, Job, Run, RunStatus } from "./types";

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
  private _startTime: string | null = null;
  private _stepIndex: number = 0;

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

  public get runStatus(): RunStatus {
    if (!this._run || !this._startTime) {
      throw `Run not created yet`;
    }

    const summary =
      this._run.status === "pass" || this._run.status === "fail"
        ? {
            fail: this._run!.status === "fail" ? 1 : 0,
            pass: this._run!.status === "pass" ? 1 : 0,
            total: 1
          }
        : null;

    return {
      runs: [{ ...this._run }],
      startTime: this._startTime,
      summary
    };
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

    this._startTime = new Date().toISOString();
    this._run.status = "runs";
    await super.beforeRun(job);
  }

  protected async beforeStep(): Promise<void> {
    this._run!.steps[this._stepIndex].status = "runs";
    await super.beforeStep();
  }

  protected async afterRun(job: Job): Promise<void> {
    this._run!.status = "pass";
    await super.afterRun(job);
  }

  protected async runStep(step: BrowserStep): Promise<void> {
    if (!this._connection) {
      throw "Not Connected";
    }

    await this._connection.run(step);
    this._run!.steps[this._stepIndex].status = "pass";
    this._stepIndex += 1;
  }
}
