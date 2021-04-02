import { connectDb } from "../server/db";
import { cuid } from "../server/utils";
import { readFile } from "./generateTypesFile";

const generateSystemEnvVariables = async (): Promise<void> => {
  const db = connectDb();

  // const privateKey = JSON.stringify(readFile("./qawolf-dev.pem"));

  await db("environment_variables").insert([
    // {
    //   id: cuid(),
    //   is_system: true,
    //   name: "GITHUB_APP_PRIVATE_KEY",
    //   value: privateKey,
    // },
    {
      id: cuid(),
      is_system: true,
      name: "RUNNER_LOCATIONS",
      value: JSON.stringify({
        westus2: {
          buffer: 3,
          latitude: 47.233,
          longitude: -119.852,
          reserved: 3,
        },
        eastus2: {
          buffer: 2,
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
