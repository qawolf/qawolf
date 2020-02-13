import { repl } from "@qawolf/repl";
// TODO
import { prompt } from "inquirer";
import { CodeCreator } from "./CodeCreator";

type PromptOptions = {
  codeCreator: CodeCreator;
  debug?: boolean;
  isTest?: boolean;
};

export const promptCodeCreator = async (options: PromptOptions) => {
  /**
   * Prompt to open a REPL or finish creating code.
   */
  const { codeCreator, debug, isTest } = options;

  const { choice } = await prompt<{ choice: string }>([
    {
      choices: [
        "💾  Save and exit",
        "🖥️  Open REPL to run code",
        "🗑️  Discard and exit"
      ],
      message: `Edit your ${
        isTest ? "test" : "script"
      } at: ${codeCreator.codeRelativePath()}`,
      name: "choice",
      type: "list"
    }
  ]);

  if (choice.includes("REPL")) {
    await repl();
    await promptCodeCreator(options);
    return;
  }

  // TODO
  // await context.close();

  if (choice.includes("Save")) {
    await codeCreator.save({ debug });
  } else {
    await codeCreator.discard();
  }

  // TODO...
  // process.exit(0);
};
