import { BrowserContext } from "playwright";
import { launch } from "../utils";
import { QAWolfWeb } from "../../src";

type EvalArguments = {
  selector: string;
  isClick?: boolean;
};

type EvalResult = {
  ms: number;
  result: string;
};

let pageFn: (...args: any[]) => any;
let runFn: (context: BrowserContext) => any;

const AVERAGE_OF_TIMES = 2;

const timeOnce = async (
  context: BrowserContext,
  pageName: string,
  evalArguments: EvalArguments
): Promise<EvalResult> => {
  const page = await context.newPage();

  await page.goto("file://" + require.resolve(`./${pageName}.html`));

  const result = await page.evaluate(pageFn, {
    ...evalArguments,
  });

  await page.waitForTimeout(10000);

  await page.close();

  return result;
};

const runMultipleAndAverage = async (
  context: BrowserContext,
  pageName: string,
  evalArguments: EvalArguments,
  testName?: string
) => {
  const times = [];
  let evalResult: string;
  for (let index = 0; index < AVERAGE_OF_TIMES; index++) {
    const result = await timeOnce(context, pageName, evalArguments);
    evalResult = result.result;
    times.push(result.ms);
  }

  const avg = times.reduce((total, time) => total + time, 0) / times.length;
  console.log(
    `\nTest: ${testName || pageName} / ${JSON.stringify(evalArguments)}`
  );
  console.log(`Result: ${evalResult}`);
  console.log(`Average: ${avg}ms`);
};

switch (process.argv[2]) {
  case "selector":
    pageFn = ({ selector }) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector(selector);

      const start = Date.now();
      const generatedSelector = qawolf.getSelector(target);
      const end = Date.now();
      return { result: generatedSelector, ms: end - start };
    };
    runFn = async (context: BrowserContext) => {
      for (let index = 0; index < 2; index++) {
        const isClick = !!index;
        // These are here as a sort of baseline
        await runMultipleAndAverage(context, "simple", {
          selector: "p",
          isClick,
        });

        await runMultipleAndAverage(
          context,
          "changelog",
          { selector: "body", isClick },
          "changelog - body"
        );

        // At the time of creation, these were extremely slow for clicks. Let's keep them fast.
        await runMultipleAndAverage(
          context,
          "changelog",
          { selector: "a", isClick },
          "changelog - top"
        );

        await runMultipleAndAverage(
          context,
          "changelog",
          { selector: "#user-content-030-may-29-2013", isClick },
          "changelog - bottom"
        );

        await runMultipleAndAverage(
          context,
          "changelog",
          { selector: "article", isClick },
          "changelog - article"
        );
      }
    };
    break;

  case "tag-cue-value":
    pageFn = ({ selector }) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector(selector);

      const start = Date.now();
      const result = qawolf.getCues(target, 0);
      const end = Date.now();
      return { result, ms: end - start };
    };
    runFn = async (context: BrowserContext) => {
      await runMultipleAndAverage(context, "simple", { selector: "p" });
      await runMultipleAndAverage(context, "changelog", {
        selector: "article",
      });
      await runMultipleAndAverage(context, "changelog", {
        selector: "#lasth2",
      });
      await runMultipleAndAverage(context, "changelog", {
        selector: "#lastul",
      });
      return null;
    };
    break;

  default:
    console.log(`
Usage: npm run test:speed -- selector
   OR  npm run test:speed -- tag-cue-value
`);
    process.exit(0);
    break;
}

const run = async () => {
  const launched = await launch({
    // devtools: true,
  });
  const context = await launched.browser.newContext();

  await runFn(context);

  await launched.browser.close();
};

run().catch(console.error.bind(console));
