import { buildTest } from "@qawolf/build-test";
import { buildWorkflow } from "@qawolf/build-workflow";
import { Browser, BrowserCreateOptions } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { outputFile, outputJson } from "fs-extra";
import { Url } from "url";

export const record = async (
  url: Url,
  name: string,
  saveEvents: boolean = false
): Promise<void> => {
  const Listr = require("listr");
  const input = require("listr-input");

  const options: BrowserCreateOptions = { recordEvents: true, url: url.href };
  if (CONFIG.domPath) options.domPath = `${CONFIG.domPath}/${name}`;

  const browser = await Browser.create(options);

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
      title: `Saving "${name}" test`,
      task: async (_: any, task: any) => {
        await browser.close();

        if (!saveTest) {
          task.skip();
          return;
        }

        if (saveEvents) {
          logger.verbose(`save events "${name}" -> ${eventsPath}`);
          await outputJson(eventsPath, browser.events, { spaces: " " });
        }

        logger.verbose(`save workflow -> ${workflowPath}`);
        const workflow = buildWorkflow({
          events: browser.events,
          name: name,
          url: url.href!
        });
        await outputJson(workflowPath, workflow, { spaces: " " });

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
