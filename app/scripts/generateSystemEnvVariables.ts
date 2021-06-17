import { connectDb } from "../server/db";
import { cuid } from "../server/utils";
import { readFile } from "./generateTypesFile";

const generateSystemEnvVariables = async (): Promise<void> => {
  const db = connectDb();

  await db("environment_variables").insert([
    {
      id: cuid(),
      is_system: true,
      name: "AZURE_ENV",
      value: JSON.stringify({
        clientId: process.env.AZURE_CLIENT_ID,
        domainId: process.env.AZURE_DOMAIN_ID,
        registryPassword: process.env.AZURE_REGISTRY_PASSWORD,
        registryServer: process.env.AZURE_REGISTRY_SERVER,
        registryUsername: process.env.AZURE_REGISTRY_USERNAME,
        resourceGroup: process.env.AZURE_RESOURCE_GROUP,
        secret: process.env.AZURE_SECRET,
        subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
        workspaceId: process.env.AZURE_WORKSPACE_ID,
        workspaceKey: process.env.AZURE_WORKSPACE_KEY,
      }),
    },
    {
      id: cuid(),
      is_system: true,
      name: "GITHUB_APP_PRIVATE_KEY",
      value: JSON.stringify(readFile("./qawolf-dev.pem")),
    },
    {
      id: cuid(),
      is_system: true,
      name: "GITHUB_APP_CLIENT_SECRET",
      value: process.env.GITHUB_APP_CLIENT_SECRET,
    },
    {
      id: cuid(),
      is_system: true,
      name: "GITHUB_SYNC_APP_PRIVATE_KEY",
      value: JSON.stringify(readFile("./qawolf-dev-sync.pem")),
    },
    {
      id: cuid(),
      is_system: true,
      name: "GITHUB_SYNC_APP_CLIENT_SECRET",
      value: process.env.GITHUB_SYNC_APP_CLIENT_SECRET,
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
          url: "http://localhost:1234",
        },
      }),
    },
  ]);

  console.log("generated system env variables");

  await db.destroy();
};

generateSystemEnvVariables();
