import ContainerInstanceManagementClient from "azure-arm-containerinstance";
import {
  Container,
  ContainerGroup,
  ContainerGroupListResult,
  IpAddress,
} from "azure-arm-containerinstance/lib/models";
import azure from "ms-rest-azure";

import environment from "../../environment";
import { Logger } from "../../Logger";
import { findSystemEnvironmentVariable } from "../../models/environment_variable";
import { AzureEnv, ModelOptions, Runner } from "../../types";
import { buildRunnerStatusUrl } from "../../utils";

type CreateContainerGroup = {
  azureEnv: AzureEnv;
  client: ContainerInstanceManagementClient;
  containers: Container[];
  ipAddress?: IpAddress;
  location: string;
  logger: Logger;
  name: string;
};

type CreateRunnerContainerGroup = {
  azureEnv: AzureEnv;
  client: ContainerInstanceManagementClient;
  logger: Logger;
  runner: Runner;
};

type GetContainerGroup = {
  azureEnv: AzureEnv;
  client: ContainerInstanceManagementClient;
  logger: Logger;
  name: string;
};

type GetRunnerContainerGroups = {
  azureEnv: AzureEnv;
  client: ContainerInstanceManagementClient;
};

type RestartRunnerContainerGroup = {
  azureEnv: AzureEnv;
  client: ContainerInstanceManagementClient;
  id: string;
  logger: Logger;
};

export const createContainerGroup = async ({
  azureEnv,
  client,
  containers,
  ipAddress,
  location,
  logger,
  name,
}: CreateContainerGroup): Promise<ContainerGroup> => {
  const log = logger.prefix("createContainerGroup");
  log.debug(
    `${name} location ${location} resource group ${azureEnv.resourceGroup}`
  );

  try {
    const group = await client.containerGroups.beginCreateOrUpdate(
      azureEnv.resourceGroup,
      name,
      {
        containers,
        diagnostics: {
          logAnalytics: {
            workspaceId: azureEnv.workspaceId,
            workspaceKey: azureEnv.workspaceKey,
          },
        },
        imageRegistryCredentials: [
          {
            password: azureEnv.registryPassword,
            server: azureEnv.registryServer,
            username: azureEnv.registryUsername,
          },
        ],
        ipAddress,
        location,
        osType: "Linux",
        restartPolicy: "onFailure",
      }
    );

    log.debug("created");

    return group;
  } catch (error) {
    log.error("not created", name, error.message);
    throw error;
  }
};

export const createRunnerContainerGroup = async ({
  azureEnv,
  client,
  logger,
  runner,
}: CreateRunnerContainerGroup): Promise<ContainerGroup> => {
  const name = `runner-${runner.id}`;

  const ports = [
    {
      port: 80,
      protocol: "TCP",
    },
    {
      port: 443,
      protocol: "TCP",
    },
  ];

  const containers: Container[] = [
    {
      environmentVariables: [
        {
          name: "QAWOLF_API_URL",
          value: `${environment.APP_URL}/api`,
        },
        {
          name: "QAWOLF_RUNNER_ID",
          value: runner.id,
        },
        {
          name: "QAWOLF_RUNNER_STATUS_URL",
          value: buildRunnerStatusUrl(runner),
        },
      ],
      image: environment.RUNNER_IMAGE,
      livenessProbe: {
        exec: {
          command: ["/bin/sh", "-c", "curl -m 15 $QAWOLF_RUNNER_STATUS_URL"],
        },
        initialDelaySeconds: 60,
        periodSeconds: 30,
        failureThreshold: 3,
        successThreshold: 1,
        timeoutSeconds: 20,
      },
      name,
      ports,
      resources: {
        requests: {
          cpu: 2,
          memoryInGB: 4,
        },
      },
    },
  ];

  const ipAddress = {
    dnsNameLabel: runner.id,
    ports,
    type: "Public",
  };

  return createContainerGroup({
    azureEnv,
    client,
    containers,
    ipAddress,
    location: runner.location,
    logger,
    name,
  });
};

export const deleteContainerGroup = async ({
  azureEnv,
  client,
  logger,
  name,
}: GetContainerGroup): Promise<ContainerGroup> => {
  const log = logger.prefix("deleteContainerGroup");
  log.debug(name);

  const containerGroup = await client.containerGroups.deleteMethod(
    azureEnv.resourceGroup,
    name
  );

  log.debug("deleted");

  return containerGroup;
};

export const findAzureEnv = async ({
  db,
  logger,
}: ModelOptions): Promise<AzureEnv> => {
  const azureEnv = await findSystemEnvironmentVariable("AZURE_ENV", {
    db,
    logger,
  });

  return JSON.parse(azureEnv.value);
};

export const getAzureClient = async (
  options: ModelOptions
): Promise<ContainerInstanceManagementClient> => {
  const azureEnv = await findAzureEnv(options);

  const credentials = await azure.loginWithServicePrincipalSecret(
    azureEnv.clientId,
    azureEnv.secret,
    azureEnv.domainId
  );

  return new ContainerInstanceManagementClient(
    credentials,
    azureEnv.subscriptionId
  );
};

export const getRunnerContainerGroups = async ({
  azureEnv,
  client,
}: GetRunnerContainerGroups): Promise<ContainerGroupListResult> => {
  const containerGroups = await client.containerGroups.listByResourceGroup(
    azureEnv.resourceGroup
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return containerGroups.filter((group) => group.name!.startsWith("runner-"));
};

export const restartRunnerContainerGroup = async ({
  azureEnv,
  client,
  id,
  logger,
}: RestartRunnerContainerGroup): Promise<void> => {
  const log = logger.prefix("restartContainerGroup");

  const name = `runner-${id}`;
  log.debug(name);

  await client.containerGroups.beginRestart(azureEnv.resourceGroup, name);

  log.debug("restarted");
};
