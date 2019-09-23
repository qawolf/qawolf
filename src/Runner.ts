import { BrowserAction, Workflow } from "./types";

type Callback = (runner: Runner) => void;

export type Callbacks = {
  onStepBegin?: Callback[];
  onWorkflowEnd?: Callback[];
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

  public async runWorkflow(workflow: Workflow): Promise<void> {
    await this.beforeWorkflow(workflow);

    for (let step of workflow.steps) {
      await this.beforeStep();
      await this.runStep(step);
    }

    await this.afterWorkflow(workflow);
  }

  protected async beforeWorkflow(workflow: Workflow): Promise<void> {
    return;
  }

  protected async beforeStep(): Promise<void> {
    return runCallbacks(this, this._callbacks.onStepBegin);
  }

  protected async runStep(step: BrowserAction): Promise<void> {
    return;
  }

  protected async afterWorkflow(workflow: Workflow): Promise<void> {
    return runCallbacks(this, this._callbacks.onWorkflowEnd);
  }
}
