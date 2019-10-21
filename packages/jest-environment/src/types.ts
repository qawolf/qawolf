import { Browser } from "@qawolf/browser";
import { Runner } from "@qawolf/runner";
import { BrowserStep, Workflow } from "@qawolf/types";
import { Page } from "puppeteer";

declare global {
  // declare the globals we expose in RunnerEnvironment
  const runner: Runner;

  function click(step: BrowserStep): Promise<void>;
  function input(step: BrowserStep, value?: string): Promise<void>;
  function scroll(step: BrowserStep): Promise<void>;

  const steps: BrowserStep[];
  const values: (string | undefined)[];
  const workflow: Workflow;

  const browser: Browser;
  function currentPage(): Promise<Page>;
  function getPage(
    index?: number,
    waitForRequests?: boolean,
    timeoutMs?: number
  ): Promise<Page>;
}
