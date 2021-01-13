import Docker from "dockerode";

export type GetDockerResponse = {
  docker: Docker;
  dockerIsRunning: boolean;
};

export default async function getDocker(): Promise<GetDockerResponse> {
  let docker = null;
  let dockerIsRunning = false;

  try {
    docker = new Docker();
    const pingResponseBuffer = await docker.ping();
    dockerIsRunning = pingResponseBuffer?.toString("utf8") === "OK";
  } catch (error) {
    console.error(
      "\nQA Wolf requires that Docker be installed and running on this computer.\nYou can install it from https://www.docker.com/products/docker-desktop\n"
    );
  }

  return {
    docker,
    dockerIsRunning,
  };
}
