import getDocker from "../../src/cli/getDocker";
import getRunnerContainer from "../../src/cli/getRunnerContainer";
import { runCli } from "../../src/cli";
import mockConsole from "../mockConsole";

jest.mock("../../src/cli/getDocker");
jest.mock("../../src/cli/getRunnerContainer");

const runCommand = () => runCli(["node", "qawolf", "stop"]);

beforeEach(() => jest.clearAllMocks());

it("prints nothing if Docker is not accessible", async () => {
  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: null, dockerIsRunning: false })
  );

  mockConsole();

  await runCommand();

  expect(global.console.error).not.toHaveBeenCalled();
  expect(global.console.log).not.toHaveBeenCalled();
});

it("succeeds if Docker container is not running", async () => {
  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: null, dockerIsRunning: true })
  );
  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ container: {}, isRunning: false })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(global.console.error).not.toHaveBeenCalled();
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Stopping QA Wolf runner service...",
      "
    Stopped.
    ",
    ]
  `);
});

it("calls stop and succeeds if Docker container is running", async () => {
  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: null, dockerIsRunning: true })
  );
  const stop = jest.fn().mockName("container.stop");
  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({
      container: {
        stop,
      },
      isRunning: true,
    })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(stop).toHaveBeenCalledTimes(1);
  expect(global.console.error).not.toHaveBeenCalled();
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Stopping QA Wolf runner service...",
      "
    Stopped.
    ",
    ]
  `);
});

it("prints error message if stopping fails", async () => {
  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: null, dockerIsRunning: true })
  );

  const stop = jest
    .fn()
    .mockName("container.stop")
    .mockImplementation(async () => {
      throw new Error("test");
    });

  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({
      container: {
        stop,
      },
      isRunning: true,
    })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(stop).toHaveBeenCalledTimes(1);
  expect(consoleCalls.error).toMatchInlineSnapshot(`
    Array [
      "test",
    ]
  `);
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Stopping QA Wolf runner service...",
    ]
  `);
});
