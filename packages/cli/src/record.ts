import { buildTest } from "@qawolf/build-code";
import { buildWorkflow } from "@qawolf/build-workflow";
import { launch, LaunchOptions } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { serializeStep } from "@qawolf/web";
import { outputFile, outputJson } from "fs-extra";
import { Url } from "url";

export const record = async (
  url: Url,
  name: string,
  saveAll: boolean = false
): Promise<void> => {
  const Listr = require("listr");
  const input = require("listr-input");

  const options: LaunchOptions = { recordEvents: true, url: url.href };
  if (CONFIG.domPath) options.domPath = `${CONFIG.domPath}/${name}`;

  const browser = await launch(options);

  let shouldSave = true;

  const destFolder = `${process.cwd()}/.qawolf`;

  const saveJson = (type: string, data: any) => {
    const path = `${destFolder}/${type}/${name}.json`;
    logger.verbose(`save ${path}`);
    return outputJson(path, data, { spaces: " " });
  };

  const tasks = new Listr([
    {
      title: "Recording browser actions",
      task: () =>
        input("Save the test [Y/n]", {
          done: (value: string) => {
            shouldSave = value.toLowerCase().trim() !== "n";
          }
        })
    },
    {
      title: `Saving "${name}" test`,
      task: async (_: any, task: any) => {
        await browser.close();

        if (!shouldSave) {
          task.skip();
          return;
        }

        if (saveAll) {
          await saveJson("events", browser.qawolf.events);
        }

        const workflow = buildWorkflow({
          events: browser.qawolf.events,
          name: name,
          url: url.href!
        });

        if (saveAll) {
          await saveJson("workflows", workflow);
        }

        await saveJson("selectors", workflow.steps.map(s => serializeStep(s)));

        const testPath = `${destFolder}/tests/${name}.test.js`;
        logger.verbose(`save ${testPath}`);
        await outputFile(testPath, buildTest(workflow), "utf8");
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
