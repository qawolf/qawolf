import openInBrowser from "better-opn";
import getDocker from "../../src/cli/getDocker";
import getRunnerContainer from "../../src/cli/getRunnerContainer";
import { runCli } from "../../src/cli";
import mockConsole from "../mockConsole";

jest.mock("../../src/cli/getDocker");
jest.mock("../../src/cli/getRunnerContainer");
jest.mock("../../src/cli/pullRunnerImage");
jest.mock("better-opn");

const runCommand = () => runCli(["node", "qawolf", "start"]);

beforeEach(() => jest.clearAllMocks());

test("only prints welcome if Docker is not accessible", async () => {
  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: null, dockerIsRunning: false })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(global.console.error).not.toHaveBeenCalled();

  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Welcome to QA Wolf!",
    ]
  `);
});

test("if no container exists, calls createContainer; create fails", async () => {
  const createContainer = jest
    .fn()
    .mockName("docker.createContainer")
    .mockImplementation(async () => {
      throw new Error("test");
    });

  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: { createContainer }, dockerIsRunning: true })
  );

  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({
      container: null,
      isRunning: true,
    })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(openInBrowser).not.toHaveBeenCalled();
  expect(consoleCalls.error).toMatchInlineSnapshot(`
    Array [
      Array [
        "Error creating container:",
        [Error: test],
      ],
    ]
  `);
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Welcome to QA Wolf!",
      "
        Starting",
    ]
  `);
});

test("if no container exists, calls createContainer; create succeeds", async () => {
  const createContainer = jest
    .fn()
    .mockName("docker.createContainer")
    .mockResolvedValue({});

  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: { createContainer }, dockerIsRunning: true })
  );

  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ container: null, isRunning: true })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(openInBrowser).toHaveBeenCalledTimes(1);
  expect(consoleCalls.error).toMatchInlineSnapshot(`Array []`);
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Welcome to QA Wolf!",
      "
        Starting",
      "
    🎉  All set - let's get testing!",
      "
        (If the QA Wolf app did not open, go to https://app.qawolf.com in a web browser.)",
      "
        When you are done, press CTRL+C to stop QA Wolf.
    ",
    ]
  `);
});

test("starts existing container; start fails", async () => {
  const start = jest
    .fn()
    .mockName("container.start")
    .mockImplementation(async () => {
      throw new Error("test");
    });

  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: null, dockerIsRunning: true })
  );

  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ container: { start }, isRunning: false })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(start).toHaveBeenCalledTimes(1);
  expect(openInBrowser).not.toHaveBeenCalled();
  expect(consoleCalls.error).toMatchInlineSnapshot(`
    Array [
      Array [
        "Error starting container:",
        "test",
      ],
    ]
  `);
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Welcome to QA Wolf!",
      "
        Starting",
    ]
  `);
});

test("starts existing container; start succeeds", async () => {
  const start = jest.fn().mockName("container.start").mockResolvedValue({});

  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: null, dockerIsRunning: true })
  );

  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ container: { start }, isRunning: false })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(start).toHaveBeenCalledTimes(1);
  expect(openInBrowser).toHaveBeenCalledTimes(1);
  expect(consoleCalls.error).toMatchInlineSnapshot(`Array []`);
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Welcome to QA Wolf!",
      "
        Starting",
      "
    🎉  All set - let's get testing!",
      "
        (If the QA Wolf app did not open, go to https://app.qawolf.com in a web browser.)",
      "
        When you are done, press CTRL+C to stop QA Wolf.
    ",
    ]
  `);
});

test("starts new container; start fails", async () => {
  const start = jest
    .fn()
    .mockName("container.start")
    .mockImplementation(async () => {
      throw new Error("test");
    });

  const createContainer = jest
    .fn()
    .mockName("docker.createContainer")
    .mockResolvedValue({ start });

  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: { createContainer }, dockerIsRunning: true })
  );

  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ container: null, isRunning: false })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(createContainer).toHaveBeenCalledTimes(1);
  expect(start).toHaveBeenCalledTimes(1);
  expect(openInBrowser).not.toHaveBeenCalled();
  expect(consoleCalls.error).toMatchInlineSnapshot(`
    Array [
      Array [
        "Error starting container:",
        "test",
      ],
    ]
  `);
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Welcome to QA Wolf!",
      "
        Starting",
    ]
  `);
});

test("starts new container; start succeeds", async () => {
  const start = jest.fn().mockName("container.start").mockResolvedValue({});

  const createContainer = jest
    .fn()
    .mockName("docker.createContainer")
    .mockResolvedValue({ start });

  (getDocker as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ docker: { createContainer }, dockerIsRunning: true })
  );

  (getRunnerContainer as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ container: null, isRunning: false })
  );

  const consoleCalls = mockConsole();

  await runCommand();

  expect(createContainer).toHaveBeenCalledTimes(1);
  expect(start).toHaveBeenCalledTimes(1);
  expect(openInBrowser).toHaveBeenCalledTimes(1);
  expect(consoleCalls.error).toMatchInlineSnapshot(`Array []`);
  expect(consoleCalls.log).toMatchInlineSnapshot(`
    Array [
      "
    🐺  Welcome to QA Wolf!",
      "
        Starting",
      "
    🎉  All set - let's get testing!",
      "
        (If the QA Wolf app did not open, go to https://app.qawolf.com in a web browser.)",
      "
        When you are done, press CTRL+C to stop QA Wolf.
    ",
    ]
  `);
});
