import Docker, { Container } from "dockerode";
import { DOCKER_CONTAINER_NAME } from "./constants";

type GetRunnerContainerResponse = {
  container: Container | null;
  isRunning: boolean;
};

export default async function getRunnerContainer(
  docker: Docker
): Promise<GetRunnerContainerResponse> {
  const container = docker.getContainer(DOCKER_CONTAINER_NAME);

  const response = {
    container: null,
    isRunning: false,
  };

  try {
    const inspectResult = await Promise.race([
      container.inspect(),
      // workaround since docker modem does not resolve 404 🤷
      new Promise((resolve) => setTimeout(() => resolve(null), 1000)),
    ]);

    if (inspectResult) {
      response.container = container;
      response.isRunning = inspectResult?.State.Running;
    }
  } catch (error) {}

  return response;
}
