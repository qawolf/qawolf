import { buildTest } from "@qawolf/build-test";
import { buildWorkflow } from "@qawolf/build-workflow";
import { Browser } from "@qawolf/browser";
import { logger } from "@qawolf/logger";
import { outputFile, outputJson } from "fs-extra";
import { Url } from "url";

export const record = async (
  url: Url,
  name: string,
  eventsOnly: boolean = false
) => {
  const Listr = require("listr");
  const input = require("listr-input");

  const browser = await Browser.create({ record: true, url: url.href });

  let saveTest = true;

  const destFolder = `${process.cwd()}/.qawolf`;
  const eventsPath = `${destFolder}/events/${name}.json`;
  const testPath = `${destFolder}/tests/${name}.test.js`;
  const workflowPath = `${destFolder}/workflows/${name}.json`;

  const tasks = new Listr([
    {
      title: "Recording browser actions",
      task: () =>
        input("Save the test [Y/n]", {
          done: (value: string) => {
            saveTest = value.toLowerCase().trim() !== "n";
          }
        })
    },
    {
      title: `Saving test to ${testPath}`,
      task: async (_: any, task: any) => {
        await browser.close();

        if (!saveTest) {
          task.skip();
          return;
        }

        if (eventsOnly) {
          // save events
          logger.verbose(`save events "${name}" -> ${eventsPath}`);
          await outputJson(eventsPath, browser.events, { spaces: " " });
          return;
        }

        // save workflow
        logger.verbose(`save workflow -> ${workflowPath}`);
        const workflow = buildWorkflow({
          events: browser.events,
          name: name,
          url: url.href!
        });
        await outputJson(workflowPath, workflow, { spaces: " " });

        // save test
        logger.verbose(`save test -> ${testPath}`);
        const test = buildTest(workflow);
        await outputFile(testPath, test, "utf8");
      }
    }
  ]);

  tasks
    .run()
    .then(() => process.exit(0))
    .catch((err: Error) => {
      console.error(err);
      process.exit(1);
    });
};
