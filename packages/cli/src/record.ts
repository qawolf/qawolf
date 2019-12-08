import { buildCode } from "@qawolf/build-code";
import { buildWorkflow } from "@qawolf/build-workflow";
import { launch } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { serializeStep } from "@qawolf/web";
import { outputFile, outputJson } from "fs-extra";
import { Url } from "url";

type RecordOptions = {
  debug?: boolean;
  name: string;
  test?: boolean;
  url: Url;
};

export const record = async (options: RecordOptions): Promise<void> => {
  const Listr = require("listr");
  const input = require("listr-input");

  const { name } = options;

  const browser = await launch({
    domPath: CONFIG.domPath ? `${CONFIG.domPath}/${name}` : undefined,
    recordEvents: true,
    url: options.url.href
  });

  const destFolder = `${process.cwd()}/.qawolf`;

  const saveJson = (type: string, data: any) => {
    const path = `${destFolder}/${type}/${name}.json`;
    logger.verbose(`save ${path}`);
    return outputJson(path, data, { spaces: " " });
  };

  let skipSave = false;

  const codePath = options.test
    ? `${destFolder}/tests/${name}.test.js`
    : `${destFolder}/scripts/${name}.js`;

  const tasks = new Listr([
    {
      title: "Recording browser actions",
      task: () =>
        input("Save [Y/n]", {
          done: (value: string) => {
            skipSave = value.toLowerCase().trim() === "n";
          }
        })
    },
    {
      title: `Saving "${codePath}"`,
      task: async (_: any, task: any) => {
        await browser.close();

        if (skipSave) {
          task.skip();
          return;
        }

        if (options.debug) {
          await saveJson("events", browser.qawolf.events);
        }

        const workflow = buildWorkflow({
          events: browser.qawolf.events,
          name: name,
          url: options.url.href!
        });

        if (options.debug) {
          await saveJson("workflows", workflow);
        }

        await saveJson("selectors", workflow.steps.map(s => serializeStep(s)));

        logger.verbose(`save ${codePath}`);
        await outputFile(
          codePath,
          buildCode({ test: options.test, workflow }),
          "utf8"
        );
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
