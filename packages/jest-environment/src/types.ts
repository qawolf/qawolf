import { Browser, FindPropertyArgs } from "@qawolf/browser";
import { Runner } from "@qawolf/runner";
import { Step, StepValue, Workflow } from "@qawolf/types";
import { Page } from "puppeteer";

declare global {
  // declare the globals we expose in RunnerEnvironment
  const runner: Runner;

  function click(step: Step): Promise<void>;
  function findProperty(
    args: FindPropertyArgs,
    timeoutMs?: number
  ): Promise<string | null | undefined>;
  function hasText(text: string, timeoutMs?: number): Promise<boolean>;
  function input(step: Step, value?: StepValue): Promise<void>;
  function scroll(step: Step, value: StepValue): Promise<void>;
  function waitUntil(
    booleanFn: () => boolean,
    timeoutMs?: number
  ): Promise<void>;

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
