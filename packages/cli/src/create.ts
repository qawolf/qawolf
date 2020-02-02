import { launch } from "@qawolf/browser";
import { buildCode, stepToSelector } from "@qawolf/build-code";
import { buildWorkflow } from "@qawolf/build-workflow";
import { logger } from "@qawolf/logger";
import { outputFile, outputJson } from "fs-extra";
import { Url } from "url";

type RecordOptions = {
  debug?: boolean;
  device?: string;
  name: string;
  path?: string;
  test?: boolean;
  url: Url;
};

export const create = async (options: RecordOptions): Promise<void> => {
  const Listr = require("listr");
  const input = require("listr-input");

  const { name } = options;

  const context = await launch({
    device: options.device,
    recordEvents: true,
    timeout: 0,
    url: options.url.href
  });

  const qawolfPath = options.path || `${process.cwd()}/.qawolf`;

  const saveJson = (type: string, data: any) => {
    const path = `${qawolfPath}/${type}/${name}.json`;
    logger.verbose(`save ${path}`);
    return outputJson(path, data, { spaces: " " });
  };

  const codeFileName = options.test ? `${name}.test.js` : `${name}.js`;

  const codePath = options.test
    ? `${qawolfPath}/tests/${codeFileName}`
    : `${qawolfPath}/scripts/${codeFileName}`;

  let skipSave = false;

  const tasks = new Listr([
    {
      title: `Capturing actions for "${codeFileName}"`,
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
        await context.close();

        if (skipSave) {
          task.skip();
          return;
        }

        const events = await context.qawolf.events();

        if (options.debug) {
          await saveJson("events", events);
        }

        const workflow = buildWorkflow({
          device: options.device,
          events,
          name: name,
          url: options.url.href!
        });

        if (options.debug) {
          await saveJson("workflows", workflow);
        }

        await saveJson(
          "selectors",
          workflow.steps.map((step, index) => ({
            // inline index so it is easy to correlate with the test
            index,
            ...stepToSelector(step)
          }))
        );

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
