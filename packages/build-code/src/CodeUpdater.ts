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

export class CodeUpdater {
  private _events: ElementEvent[] = [];
  private _options: ConstructorOptions;

  private _pendingStepIndex: number = 0;
  public _steps: Step[] = [];

  constructor(options: ConstructorOptions) {
    this._options = options;
  }

  public static canUpdate(code: string) {
    return code.includes(CREATE_CODE_SYMBOL);
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
    return this._steps.length - this._pendingStepIndex;
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

  public updateCode(code: string): string | null {
    const startIndex = this._pendingStepIndex;
    if (startIndex === this._steps.length) return code;

    const codeToInsert =
      buildStepsCode({
        startIndex,
        steps: this._steps,
        isTest: this._options.isTest
      }) + `${CREATE_CODE_SYMBOL}`;

    return code.replace(CREATE_CODE_SYMBOL, codeToInsert);
  }
}
