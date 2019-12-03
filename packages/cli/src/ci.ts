import { copy, outputFile, pathExists, readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { prompt } from "inquirer";
import path from "path";
const { version } = require("../package");

type CiProvider = "azure" | "circleci" | "github" | "gitlab";

const paths = {
  azure: "azure-pipelines.yml",
  circleci: ".circleci/config.yml",
  github: ".github/workflows/qawolf.yml",
  gitlab: ".gitlab-ci.yml"
};

export const saveCiTemplate = async (provider: CiProvider): Promise<void> => {
  const providerPath = paths[provider];

  const outputPath = path.join(process.cwd(), providerPath);

  if (await pathExists(outputPath)) {
    const { overwrite } = await prompt<{ overwrite: boolean }>([
      {
        message: `"${outputPath}" already exists, overwrite it?`,
        name: "overwrite",
        type: "confirm"
      }
    ]);
    if (!overwrite) return;
  }

  const ciTemplate = compile(
    readFileSync(path.resolve(__dirname, `../static/${provider}.hbs`), "utf8")
  );
  const ci = ciTemplate({ version });

  await outputFile(outputPath, ci, "utf8");

  console.log(`Saved ${provider} template to ${outputPath}`);
};
