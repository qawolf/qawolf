import { connectDb } from "../server/db";
import { cuid } from "../server/utils";
import { readFile } from "./generateTypesFile";

const generateSystemEnvVariables = async (): Promise<void> => {
  const db = connectDb();

  await db("environment_variables").insert([
    {
      id: cuid(),
      is_system: true,
      name: "GITHUB_APP_PRIVATE_KEY",
      value: JSON.stringify(readFile("./qawolf-dev.pem")),
    },
    {
      id: cuid(),
      is_system: true,
      name: "RUNNER_LOCATIONS",
      value: JSON.stringify({
        eastus2: {
          buffer: 1,
          latitude: 36.6681,
          longitude: -78.3889,
          reserved: 0,
        },
      }),
    },
  ]);

  console.log("generated system env variables");

  await db.destroy();
};

generateSystemEnvVariables();
