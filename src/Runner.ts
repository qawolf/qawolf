import { BrowserAction, Workflow } from "./types";

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

  public async step(step: BrowserAction): Promise<void> {
    await this.beforeStep();
    await this.runStep(step);
  }

  public async run(workflow: Workflow): Promise<void> {
    await this.beforeWorkflow(workflow);

    for (let step of workflow.steps) {
      await this.step(step);
    }

    await this.afterWorkflow(workflow);
  }

  protected async beforeWorkflow(workflow: Workflow): Promise<void> {
    return;
  }

  protected async beforeStep(): Promise<void> {
    return runCallbacks(this, this._callbacks.beforeStep);
  }

  protected async afterWorkflow(workflow: Workflow): Promise<void> {
    return runCallbacks(this, this._callbacks.afterRun);
  }

  protected async runStep(step: BrowserAction): Promise<void> {
    return;
  }
}
