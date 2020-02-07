import { buildSteps } from "@qawolf/build-workflow";
import { logger } from "@qawolf/logger";
import { ElementEvent, Step } from "@qawolf/types";
import { sortBy } from "lodash";
import { buildStepsCode, stepToSelector } from "../build";
import { PATCH_HANDLE } from "./patchCode";

type ConstructorOptions = {
  stepStartIndex?: number;
};

export class PatchBuilder {
  /**
   * Build a patch for non-included steps.
   */
  private _numIncludedSteps: number = 0;
  private _events: ElementEvent[] = [];
  private _finalized: boolean = false;
  private _steps: Step[] = [];

  // used for code with existing steps
  private _stepStartIndex: number;

  public constructor(options: ConstructorOptions = {}) {
    this._stepStartIndex = options.stepStartIndex || 0;
  }

  private _buildSteps({ canChange }: { canChange: boolean }) {
    const steps = buildSteps({
      canChange,
      events: this.getEvents(),
      stepStartIndex: this._stepStartIndex
    });

    const newSteps = steps.slice(this._steps.length);
    if (!newSteps.length) return;

    logger.debug(`StepTracker: build new steps ${JSON.stringify(newSteps)}`);
    this._steps.push(...newSteps);
  }

  private stepsToPatch() {
    const newSteps = this._steps.slice(this._numIncludedSteps);
    return newSteps;
  }

  public buildPatch(isTest?: boolean) {
    const stepsToPatch = this.stepsToPatch();
    if (stepsToPatch.length < 1) {
      return null;
    }

    let code = buildStepsCode({
      steps: stepsToPatch,
      isTest
    });

    // include the patch symbol so we can replace it later
    code += PATCH_HANDLE;

    const selectors = stepsToPatch.map(step => ({
      ...stepToSelector(step),
      // inline index so it is easy to correlate with the test
      index: step.index
    }));

    return { code, selectors, steps: stepsToPatch };
  }

  public getEvents() {
    return sortBy(this._events, e => e.time);
  }

  public pushEvent(event: ElementEvent) {
    if (this._finalized) return;

    this._events.push(event);
    this._buildSteps({ canChange: false });
  }

  public setIncludedSteps(numIncludedSteps: number) {
    if (numIncludedSteps < this._numIncludedSteps) {
      throw new Error("Can only increase numIncludedSteps");
    }

    this._numIncludedSteps = numIncludedSteps;
  }

  public finalize() {
    this._finalized = true;

    this._buildSteps({
      // there are no new events coming in
      // so we know the steps that canChange will not
      canChange: true
    });
  }
}
