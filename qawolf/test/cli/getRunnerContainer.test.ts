import getRunnerContainer from "../../src/cli/getRunnerContainer";

const inspect = jest.fn().mockName("container.inspect");

const docker = {
  getContainer: jest.fn().mockName("docker.getContainer"),
};

beforeEach(() => jest.clearAllMocks());

test("when inspect fails", async () => {
  inspect.mockRejectedValueOnce(new Error("fail"));
  docker.getContainer.mockResolvedValue({ inspect });
  const result = await getRunnerContainer(docker as any);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "container": null,
      "isRunning": false,
    }
  `);
});

test("when inspect succeeds, not running", async () => {
  inspect.mockResolvedValue({ State: { Running: false } });
  docker.getContainer.mockResolvedValue({ inspect });
  const result = await getRunnerContainer(docker as any);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "container": null,
      "isRunning": false,
    }
  `);
});

test("when inspect succeeds, running", async () => {
  inspect.mockResolvedValue({ State: { Running: true } });
  docker.getContainer.mockResolvedValue({ inspect });
  const result = await getRunnerContainer(docker as any);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "container": null,
      "isRunning": false,
    }
  `);
});
