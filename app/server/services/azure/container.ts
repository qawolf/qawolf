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
import { Runner } from "../../types";
import { buildRunnerStatusUrl } from "../../utils";

type CreateContainerGroup = {
  client: ContainerInstanceManagementClient;
  containers: Container[];
  ipAddress?: IpAddress;
  location: string;
  logger: Logger;
  name: string;
};

type CreateRunnerContainerGroup = {
  client: ContainerInstanceManagementClient;
  logger: Logger;
  runner: Runner;
};

type GetContainerGroup = {
  client: ContainerInstanceManagementClient;
  logger: Logger;
  name: string;
};

type RestartRunnerContainerGroup = {
  client: ContainerInstanceManagementClient;
  id: string;
  logger: Logger;
};

export const createContainerGroup = async ({
  client,
  containers,
  ipAddress,
  location,
  logger,
  name,
}: CreateContainerGroup): Promise<ContainerGroup> => {
  const log = logger.prefix("createContainerGroup");
  log.debug(
    `${name} location ${location} resource group ${environment.AZURE_RESOURCE_GROUP}`
  );

  try {
    const group = await client.containerGroups.beginCreateOrUpdate(
      environment.AZURE_RESOURCE_GROUP,
      name,
      {
        containers,
        diagnostics: {
          logAnalytics: {
            workspaceId: environment.AZURE_WORKSPACE_ID,
            workspaceKey: environment.AZURE_WORKSPACE_KEY,
          },
        },
        imageRegistryCredentials: [
          {
            password: environment.AZURE_REGISTRY_PASSWORD,
            server: environment.AZURE_REGISTRY_SERVER,
            username: environment.AZURE_REGISTRY_USERNAME,
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
          command: ["/bin/sh", "-c", "curl -m 2 $QAWOLF_RUNNER_STATUS_URL"],
        },
        initialDelaySeconds: 60,
        periodSeconds: 30,
        failureThreshold: 3,
        timeoutSeconds: 5,
      },
      name,
      ports,
      resources: {
        requests: {
          cpu: 2,
          memoryInGB: 2,
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
    client,
    containers,
    ipAddress,
    location: runner.location,
    logger,
    name,
  });
};

export const deleteContainerGroup = async ({
  client,
  logger,
  name,
}: GetContainerGroup): Promise<ContainerGroup> => {
  const log = logger.prefix("deleteContainerGroup");
  log.debug(name);

  const containerGroup = await client.containerGroups.deleteMethod(
    environment.AZURE_RESOURCE_GROUP,
    name
  );

  log.debug("deleted");

  return containerGroup;
};

export const getAzureClient = async (): Promise<ContainerInstanceManagementClient> => {
  const credentials = await azure.loginWithServicePrincipalSecret(
    environment.AZURE_CLIENT_ID,
    environment.AZURE_SECRET,
    environment.AZURE_DOMAIN_ID
  );

  return new ContainerInstanceManagementClient(
    credentials,
    environment.AZURE_SUBSCRIPTION_ID
  );
};

export const getRunnerContainerGroups = async (
  client: ContainerInstanceManagementClient
): Promise<ContainerGroupListResult> => {
  const containerGroups = await client.containerGroups.listByResourceGroup(
    environment.AZURE_RESOURCE_GROUP
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return containerGroups.filter((group) => group.name!.startsWith("runner-"));
};

export const restartRunnerContainerGroup = async ({
  client,
  id,
  logger,
}: RestartRunnerContainerGroup): Promise<void> => {
  const log = logger.prefix("restartContainerGroup");

  const name = `runner-${id}`;
  log.debug(name);

  await client.containerGroups.beginRestart(
    environment.AZURE_RESOURCE_GROUP,
    name
  );

  log.debug("restarted");
};
