import program, { Command } from "commander";
import { bold } from "kleur";
import getDocker from "./getDocker";
import getRunnerContainer from "./getRunnerContainer";

export const buildStopCommand = (): program.Command => {
  const command = new Command("stop")
    .storeOptionsAsProperties(false)
    .description("✨ Stop a running QA Wolf runner service")
    .action(async () => {
      const { docker, dockerIsRunning } = await getDocker();
      if (!dockerIsRunning) return;

      console.log(bold("\n🐺  Stopping QA Wolf runner service..."));

      // Get a reference to already running runner container if possible
      const { container, isRunning } = await getRunnerContainer(docker);

      if (container && isRunning) {
        try {
          await container.stop();
        } catch (error) {
          console.error(error.message);
          return;
        }
      }

      console.log("\nStopped.\n");
    });

  return command;
};
