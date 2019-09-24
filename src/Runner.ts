import { createRunFromJob } from "./callbacks/cli";
import { BrowserStep, Job, Run, RunStatus } from "./types";

export type Callback = (runner: Runner) => void;

export type Callbacks = {
  beforeStep?: Callback[];
  afterStep?: Callback[];
  afterRun?: Callback[];
};

export class Runner {
  private _callbacks: Callbacks;
  private _run: Run | null = null;
  private _startTime: string | null = null;
  private _stepIndex: number = 0;

  constructor(callbacks?: Callbacks) {
    this._callbacks = callbacks || {};
  }

  public async step(step: BrowserStep): Promise<void> {
    await this.beforeStep();
    await this.runStep(step);
    await this.afterStep();
  }

  public async run(job: Job): Promise<void> {
    await this.beforeRun(job);

    for (let step of job.steps) {
      await this.step(step);
    }

    await this.afterRun(job);
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
    this._run.status = "runs";

    this._startTime = new Date().toISOString();
  }

  protected async beforeStep(): Promise<void> {
    this._run!.steps[this._stepIndex].status = "runs";

    return runCallbacks(this, this._callbacks.beforeStep);
  }

  protected async afterStep(): Promise<void> {
    this._run!.steps[this._stepIndex].status = "pass";
    this._stepIndex += 1;

    return runCallbacks(this, this._callbacks.afterStep);
  }

  protected async afterRun(job: Job): Promise<void> {
    this._run!.status = "pass";

    return runCallbacks(this, this._callbacks.afterRun);
  }

  protected async runStep(step: BrowserStep): Promise<void> {
    return;
  }
}

const runCallbacks = async (
  runner: Runner,
  callbacks?: Callback[]
): Promise<void> => {
  await Promise.all((callbacks || []).map(callback => callback(runner)));
};
