import * as launch from "../src/environment/launch";
import { start } from "../src/index";
import { RunnerServer } from "../src/server/RunnerServer";

const launchSpy = jest.spyOn(launch, "launch");

describe("start", () => {
  let server: RunnerServer;

  beforeAll(async () => {
    server = await start();
  });

  afterAll(() => server.close());

  it("launches a browser to skip cold start", async () => {
    expect(launchSpy).toBeCalledTimes(1);
  });
});
