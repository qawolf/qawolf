import { copy, pathExists } from "fs-extra";
import { prompt } from "inquirer";
import path from "path";

type CiProvider = "azure" | "circleci" | "github";

const paths = {
  azure: "azure-pipelines.yml",
  circleci: ".circleci/config.yml",
  github: ".github/workflows/qawolf.yml"
};

export const saveCiTemplate = async (provider: CiProvider): Promise<void> => {
  const providerPath = paths[provider];

  const sourcePath = path.join(__dirname, `../static/${provider}.yml`);

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

  await copy(sourcePath, outputPath);
  console.log(`Saved ${provider} template to ${outputPath}`);
};
