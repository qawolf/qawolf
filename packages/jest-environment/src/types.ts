import { Browser, FindPropertyArgs, Page, Selector } from "@qawolf/browser";
import { Runner } from "@qawolf/runner";
import { ScrollValue, Step, StepValue, Workflow } from "@qawolf/types";

declare global {
  // declare the globals we expose in RunnerEnvironment
  const runner: Runner;

  function click(selectorOrStep: Selector | Step): Promise<void>;
  function findProperty(
    args: FindPropertyArgs,
    timeoutMs?: number
  ): Promise<string | null | undefined>;
  function hasText(text: string, timeoutMs?: number): Promise<boolean>;
  function scroll(
    selectorOrStep: Selector | Step,
    value: ScrollValue
  ): Promise<void>;
  function select(
    selectorOrStep: Selector | Step,
    value: string | null
  ): Promise<void>;
  function type(
    selectorOrStep: Selector | Step,
    value?: string | null
  ): Promise<void>;

  function waitUntil(
    booleanFn: () => boolean,
    timeoutMs?: number
  ): Promise<void>;

  const steps: Step[];
  const workflow: Workflow;

  const browser: Browser;
  function currentPage(): Promise<Page>;
  function getPage(
    index?: number,
    waitForRequests?: boolean,
    timeoutMs?: number
  ): Promise<Page>;
}
