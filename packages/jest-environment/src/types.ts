import { Browser } from "@qawolf/browser";
import { Runner } from "@qawolf/runner";
import { AssertOptions, Step, StepValue, Workflow } from "@qawolf/types";
import { Page } from "puppeteer";

declare global {
  // declare the globals we expose in RunnerEnvironment
  const runner: Runner;

  function click(step: Step): Promise<void>;
  function hasText(text: string, options?: AssertOptions): Promise<boolean>;
  function input(step: Step, value?: StepValue): Promise<void>;
  function scrollElement(step: Step, value: StepValue): Promise<void>;

  const steps: Step[];
  const values: StepValue[];
  const workflow: Workflow;

  const browser: Browser;
  function currentPage(): Promise<Page>;
  function getPage(
    index?: number,
    waitForRequests?: boolean,
    timeoutMs?: number
  ): Promise<Page>;
}
