import { buildWorkflow } from "@qawolf/build-workflow";
import { logger } from "@qawolf/logger";
import { ElementEvent, Step } from "@qawolf/types";
import { sortBy } from "lodash";
import { buildStepsCode } from "./buildStepsCode";
import { getIndentation, indent } from "./indent";

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

  public static hasCreateSymbol(code: string) {
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
      logger.debug(`CodeUpdater: new step ${step.action}`);
      this._steps.push(step);
    });
  }

  public updateCode(code: string): string {
    if (!CodeUpdater.hasCreateSymbol(code)) {
      throw new Error("Cannot update code without create symbol");
    }

    if (this.numPendingSteps < 1) {
      throw new Error("No code to update");
    }

    const startIndex = this._pendingStepIndex;

    // move the pending step forward
    this._pendingStepIndex = this._steps.length;

    const codeToInsert =
      buildStepsCode({
        startIndex,
        steps: this._steps,
        isTest: this._options.isTest
      }) + `${CREATE_CODE_SYMBOL}`;

    const numSpaces = getIndentation(code, CREATE_CODE_SYMBOL);

    const updatedCode = code.replace(
      CREATE_CODE_SYMBOL,
      indent(codeToInsert, numSpaces, 1)
    );

    return updatedCode;
  }
}
