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
  let info;

  try {
    info = await container.inspect();
  } catch (error) {
    return {
      container: null,
      isRunning: false,
    };
  }

  return {
    container,
    isRunning: info?.State.Running,
  };
}
