import { buildAction } from "@qawolf/github";
import { outputFile } from "fs-extra";

export const githubAction = async (): Promise<void> => {
  const Listr = require("listr");

  const actionPath = `${process.cwd()}/.github/workflows/qawolf.yml`;

  const tasks = new Listr([
    {
      title: "Saving GitHub Action to '.github/workflows/qawolf.yml'",
      task: async () => {
        const action = buildAction();

        await outputFile(actionPath, action, "utf8");
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
