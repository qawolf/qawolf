import openInBrowser from "better-opn";
import program, { Command } from "commander";
import { bold } from "kleur";
import {
  CLI_NAME,
  DOCKER_CONTAINER_NAME,
  DOCKER_IMAGE_NAME,
  QAWOLF_URL,
} from "./constants";
import getDocker from "./getDocker";
import getRunnerContainer from "./getRunnerContainer";
import pullRunnerImage from "./pullRunnerImage";

export const buildStartCommand = (): program.Command => {
  const command = new Command("start")
    .option(
      "-b, --background",
      `run QA Wolf in the background. Use \`${CLI_NAME} stop\` to stop it.`
    )
    .option("-v, --verbose", "enable extra logging")
    .description("✨ Start a QA Wolf runner service to record or run tests")
    .action(async ({ background, verbose }) => {
      console.log(bold("\n🐺  Welcome to QA Wolf!"));

      const { docker, dockerIsRunning } = await getDocker();
      if (!dockerIsRunning) return;

      await pullRunnerImage(docker, verbose);

      console.log("\n    Starting");

      // Get a reference to already running runner container if possible
      const containerResponse = await getRunnerContainer(docker);
      let { container } = containerResponse;

      // Otherwise create the runner container
      if (!container) {
        try {
          container = await docker.createContainer({
            ExposedPorts: {
              "26367/tcp": {},
            },
            HostConfig: {
              AutoRemove: true,
              PortBindings: {
                "26367/tcp": [
                  {
                    HostPort: "26367",
                  },
                ],
              },
            },
            Image: DOCKER_IMAGE_NAME,
            name: DOCKER_CONTAINER_NAME,
          });
        } catch (error) {
          console.error("Error creating container:", error);
          return;
        }
      }

      if (!containerResponse.isRunning) {
        try {
          await container.start();
        } catch (error) {
          console.error("Error starting container:", error.message);
          return;
        }
      }

      openInBrowser(QAWOLF_URL);

      console.log(`\n🎉  All set - let's get testing!`);
      console.log(
        `\n    (If the QA Wolf app did not open, go to ${QAWOLF_URL} in a web browser.)`
      );

      if (background) {
        console.log(
          `\n    When you are done, run \`${CLI_NAME} stop\` to stop QA Wolf.\n`
        );
      } else {
        console.log("\n    When you are done, press CTRL+C to stop QA Wolf.\n");

        // These things cause leaking in Jest tests, so do them only when not running tests
        if (typeof jest === "undefined") {
          process.on("SIGINT", async () => {
            console.log("\n    Stopping");
            try {
              await container.stop();
              console.log("\n    Stopped\n");
            } catch (error) {
              if (error.message.includes("No such container")) {
                console.log("\n    Stopped\n");
              } else {
                console.error(error.message);
              }
            }
            process.exit(0);
          });
          setInterval(() => {
            // Keeping Node process alive until SIGINT
          }, 1 << 30);
        }
      }
    });

  return command;
};
