import { buildSteps } from "@qawolf/build-workflow";
import { logger } from "@qawolf/logger";
import { ElementEvent, Step } from "@qawolf/types";
import { sortBy } from "lodash";

type ConstructorOptions = {
  isTest?: boolean;
  startIndex?: number;
};

export class StepBuilder {
  /**
   * Build steps as we receive events.
   */
  private _events: ElementEvent[] = [];
  private _finalized: boolean = false;
  private _steps: Step[] = [];

  // used for code with existing steps
  private _startIndex: number;

  public constructor({ startIndex }: ConstructorOptions = {}) {
    this._startIndex = startIndex || 0;
  }

  private _buildSteps({ canChange }: { canChange: boolean }) {
    const steps = buildSteps({
      canChange,
      events: this.getEvents(),
      startIndex: this._startIndex
    });

    const newSteps = steps.slice(this._steps.length);
    if (!newSteps.length) return;

    logger.debug(`StepTracker: built new steps ${JSON.stringify(newSteps)}`);
    this._steps.push(...newSteps);
  }

  public finalize() {
    this._finalized = true;

    this._buildSteps({
      // there are no new events coming in
      // so we know the steps that canChange will not
      canChange: true
    });
  }

  public getEvents() {
    return sortBy(this._events, e => e.time);
  }

  public pushEvent(event: ElementEvent) {
    if (this._finalized) return;

    this._events.push(event);
    this._buildSteps({ canChange: false });
  }

  public steps() {
    return this._steps;
  }
}
