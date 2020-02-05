import { buildWorkflow } from "@qawolf/build-workflow";
import { ElementEvent, Step } from "@qawolf/types";
import { sortBy } from "lodash";
import { buildStepsCode } from "./buildStepsCode";

export const CREATE_CODE_SYMBOL = "// 🐺 CREATE CODE HERE";

type ConstructorOptions = {
  device?: string;
  isTest?: boolean;
  name: string;
  url: string;
};

// TODO we need to update selectors too?

export class CodeUpdater {
  private _events: ElementEvent[] = [];
  private _options: ConstructorOptions;

  private _commitedStepIndex: number = 0;
  public _steps: Step[] = [];

  constructor(options: ConstructorOptions) {
    this._options = options;
  }

  private _buildWorkflow() {
    const workflow = buildWorkflow({
      device: this._options.device,
      events: sortBy(this._events, e => e.time),
      name: this._options.name,
      url: this._options.url
    });
    return workflow;
  }

  public get numPendingSteps() {
    return this._steps.length - this._commitedStepIndex;
  }

  public prepareSteps(events: ElementEvent[]) {
    this._events.push(...events);

    const workflow = this._buildWorkflow();
    const steps = workflow.steps.filter(step => step.isFinal);

    const newSteps = steps.slice(this._steps.length);
    newSteps.forEach(step => {
      this._steps.push(step);

      // TODO push selectors here too...
    });
  }

  public createSteps(code: string): string | null {
    const newSteps = this._steps.slice(this._steps.length);
    if (newSteps.length < 1) return code;

    // TODO log error if create symbol is not found (debounced)
    // code.replace()

    const codeToInsert = buildStepsCode(newSteps);
    return code.replace(CREATE_CODE_SYMBOL, codeToInsert);
  }
}
