import Docker from "dockerode";
import getDocker from "../../src/cli/getDocker";
import mockConsole from "../mockConsole";

jest.mock("dockerode");

beforeEach(() => jest.clearAllMocks());

test("successful ping", async () => {
  (Docker as any).mockImplementation(() => {
    return {
      ping: async () => Buffer.from("OK"),
    };
  });

  const consoleCalls = mockConsole();

  const result = await getDocker();
  expect(result).toMatchInlineSnapshot(`
    Object {
      "docker": Object {
        "ping": [Function],
      },
      "dockerIsRunning": true,
    }
  `);

  expect(consoleCalls.error).toMatchInlineSnapshot(`Array []`);
  expect(consoleCalls.log).toMatchInlineSnapshot(`Array []`);
});

test("failed ping", async () => {
  (Docker as any).mockImplementation(() => {
    return {
      ping: async () => {
        throw new Error("404");
      },
    };
  });

  const consoleCalls = mockConsole();

  const result = await getDocker();
  expect(result).toMatchInlineSnapshot(`
    Object {
      "docker": Object {
        "ping": [Function],
      },
      "dockerIsRunning": false,
    }
  `);

  expect(consoleCalls.error).toMatchInlineSnapshot(`
    Array [
      "
    QA Wolf requires that Docker be installed and running on this computer.
    You can install it from https://www.docker.com/products/docker-desktop
    ",
    ]
  `);
  expect(consoleCalls.log).toMatchInlineSnapshot(`Array []`);
});
