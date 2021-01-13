import { db } from "../server/db";
import { cuid } from "../server/utils";
import { readFile } from "./generateTypesFile";

const generateSystemEnvVariables = async (): Promise<void> => {
  const privateKey = JSON.stringify(readFile("./qawolf-dev.pem"));

  await db("environment_variables").insert({
    id: cuid(),
    is_system: true,
    name: "GITHUB_APP_PRIVATE_KEY",
    value: privateKey,
  });

  console.log("generated system env variables");
};

generateSystemEnvVariables();
