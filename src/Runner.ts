import { BrowserAction, Workflow } from "./types";

type Callback = (runner: Runner) => void;

export type Callbacks = {
  onStepBegin?: Callback[];
  onWorkflowEnd?: Callback[];
};

export class Runner {
  private _callbacks: Callbacks;

  constructor(callbacks?: Callbacks) {
    this._callbacks = callbacks || {};
  }

  private async runCallbacks(callbacks?: Callback[]): Promise<void> {
    if (!callbacks || !callbacks.length) return;

    const callbackPromises = callbacks.map(callback => {
      return callback(this);
    });

    await Promise.all(callbackPromises);
  }

  protected async afterWorkflow(workflow: Workflow): Promise<void> {
    return this.runCallbacks(this._callbacks.onWorkflowEnd);
  }

  protected async beforeWorkflow(workflow: Workflow): Promise<void> {
    return;
  }

  protected async beforeStep(): Promise<void> {
    return this.runCallbacks(this._callbacks.onStepBegin);
  }

  protected async runStep(step: BrowserAction): Promise<void> {
    return;
  }

  public async runWorkflow(workflow: Workflow): Promise<void> {
    await this.beforeWorkflow(workflow);

    for (let step of workflow.steps) {
      await this.beforeStep();
      await this.runStep(step);
    }

    await this.afterWorkflow(workflow);
  }
}
