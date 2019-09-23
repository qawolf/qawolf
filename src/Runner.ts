import { BrowserStep, Job } from "./types";

type Callback = (runner: Runner) => void;

export type Callbacks = {
  beforeStep?: Callback[];
  afterRun?: Callback[];
};

const runCallbacks = async (
  runner: Runner,
  callbacks?: Callback[]
): Promise<void> => {
  await Promise.all(
    (callbacks || []).map(callback => {
      return callback(runner);
    })
  );
};

export class Runner {
  private _callbacks: Callbacks;

  constructor(callbacks?: Callbacks) {
    this._callbacks = callbacks || {};
  }

  public async step(step: BrowserStep): Promise<void> {
    await this.beforeStep();
    await this.runStep(step);
  }

  public async run(job: Job): Promise<void> {
    await this.beforeRun(job);

    for (let step of job.steps) {
      await this.step(step);
    }

    await this.afterRun(job);
  }

  protected async beforeRun(job: Job): Promise<void> {
    return;
  }

  protected async beforeStep(): Promise<void> {
    return runCallbacks(this, this._callbacks.beforeStep);
  }

  protected async afterRun(job: Job): Promise<void> {
    return runCallbacks(this, this._callbacks.afterRun);
  }

  protected async runStep(step: BrowserStep): Promise<void> {
    return;
  }
}
