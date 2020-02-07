// import { buildWorkflow } from "@qawolf/build-workflow";
// import { sortBy } from "lodash";

// type ConstructorOptions = {
//   device?: string;
//   isTest?: boolean;
//   name: string;
//   stepStartIndex?: number;
//   url: string;
// };

// type PrepareStepsOptions = {
//   newEvents?: ElementEvent[];
//   onlyFinalSteps?: boolean;
// };

// export class WorkflowTracker {
//   // -- track existing steps/selectors etc --
//   // -- allowFinal() --
//   // -- pending --
//   private _events: ElementEvent[] = [];

//   private _buildWorkflow(onlyFinalSteps?: boolean) {
//     const workflow = buildWorkflow({
//       device: this._options.device,
//       events: this.getEvents(),
//       onlyFinalSteps,
//       name: this._options.name,
//       stepStartIndex: this._options.stepStartIndex,
//       url: this._options.url
//     });
//     return workflow;
//   }

//   public getEvents() {
//     return sortBy(this._events, e => e.time);
//   }

//   public getNumPendingSteps() {
//     return this._steps.length - this._pendingStepIndex;
//   }

//   // protected async _saveDebugFiles(workflow: Workflow) {
//   //   const rootPath = dirname(this._options.codePath);
//   //   await outputJson(join(rootPath, "../events"), this._updater.getEvents(), {
//   //     spaces: " "
//   //   });

//   //   await outputJson(join(rootPath, "../workflows"), workflow, {
//   //     spaces: " "
//   //   });
//   // }

//   // public prepareSteps(options: PrepareStepsOptions): Workflow {
//   //   if (options.newEvents) {
//   //     this._events.push(...options.newEvents);
//   //   }
//   //   const workflow = this._buildWorkflow(options.onlyFinalSteps);
//   //   const newSteps = workflow.steps.slice(this._steps.length);
//   //   newSteps.forEach(step => {
//   //     logger.debug(`CodeUpdater: new step ${step.action}`);
//   //     this._steps.push(step);
//   //   });
//   //   return workflow;
//   // }
// }
