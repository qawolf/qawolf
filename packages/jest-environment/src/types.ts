import { Browser } from "@qawolf/browser";
import { Runner } from "@qawolf/runner";
import { BrowserStep, Job } from "@qawolf/types";
import { Page } from "puppeteer";

declare global {
  // declare the globals we expose in RunnerEnvironment
  const runner: Runner;

  function click(step: BrowserStep): Promise<void>;
  function input(step: BrowserStep, value?: string): Promise<void>;
  function scroll(step: BrowserStep): Promise<void>;

  const job: Job;
  const steps: BrowserStep[];
  const values: (string | undefined)[];

  const browser: Browser;
  function currentPage(): Promise<Page>;
  function getPage(
    index?: number,
    waitForRequests?: boolean,
    timeoutMs?: number
  ): Promise<Page>;

  // need to export something
  export const _empty: void;
}

// need to export something
export {};
